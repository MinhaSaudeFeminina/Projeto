// Expo's dev server on its own cannot serve a cross-origin-isolated page, and
// expo-sqlite on web needs one: it talks to its wa-sqlite worker through
// `SharedArrayBuffer`, which browsers only expose when the document carries
// `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`.
//
// `metro.config.js` sets those headers through `server.enhanceMiddleware`, but
// Expo appends that hook *after* its own middleware stack, and the HTML
// document is answered by one of Expo's middlewares - so the headers never
// reach the response that matters.
//
// This wraps the dev server in a proxy that adds them to everything, including
// the websocket used for fast refresh. Metro moves to an internal port and the
// proxy keeps the public one, so `npm run web` behaves exactly as before.
import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const publicPort = Number(process.env.PORT ?? 8081);
const metroPort = Number(process.env.METRO_PORT ?? publicPort + 1);
const metroHost = '127.0.0.1';

const isolationHeaders = {
  // `credentialless` rather than `require-corp` so cross-origin requests to the
  // API keep working without every response needing a CORP header.
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

// So the script also works when invoked directly, not only through `npm run`.
const localBin = fileURLToPath(new URL('../node_modules/.bin', import.meta.url));

const metro = spawn('expo', ['start', '--web', '--port', String(metroPort)], {
  env: {
    ...process.env,
    BROWSER: 'none',
    PATH: `${localBin}:${process.env.PATH ?? ''}`,
  },
  // stdin is ignored rather than inherited: under `docker compose up` it is
  // closed, and Expo shuts itself down when the terminal it is attached to
  // goes away.
  stdio: ['ignore', 'inherit', 'inherit'],
});

metro.on('exit', (code, signal) => {
  console.error(`\nMetro encerrou (code=${code}, signal=${signal}).`);
  process.exit(code ?? 1);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    metro.kill(signal);
  });
}

const proxy = http.createServer((request, response) => {
  const upstream = http.request(
    {
      headers: request.headers,
      host: metroHost,
      method: request.method,
      path: request.url,
      port: metroPort,
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, {
        ...upstreamResponse.headers,
        ...isolationHeaders,
      });
      upstreamResponse.pipe(response);
    },
  );

  upstream.on('error', () => {
    if (!response.headersSent) {
      response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    }

    response.end('O servidor de desenvolvimento nao respondeu.');
  });

  // A browser that goes away mid-response destroys the socket. Without these
  // the stream error is unhandled and takes the whole dev server down.
  request.on('error', () => upstream.destroy());
  response.on('error', () => upstream.destroy());

  request.pipe(upstream);
});

// Fast refresh and the dev-tools channel run over websockets, which never go
// through the request handler above.
proxy.on('upgrade', (request, socket, head) => {
  const upstream = net.connect(metroPort, metroHost, () => {
    const headerLines = Object.entries(request.headers).flatMap(([name, value]) =>
      Array.isArray(value)
        ? value.map((item) => `${name}: ${item}`)
        : [`${name}: ${value}`],
    );

    upstream.write(
      `${request.method} ${request.url} HTTP/1.1\r\n${headerLines.join('\r\n')}\r\n\r\n`,
    );

    if (head?.length) {
      upstream.write(head);
    }

    socket.pipe(upstream).pipe(socket);
  });

  upstream.on('error', () => socket.destroy());
  socket.on('error', () => upstream.destroy());
});

process.on('uncaughtException', (error) => {
  console.error('Erro nao tratado no proxy:', error);
});

await waitForMetro();

proxy.listen(publicPort, '0.0.0.0', () => {
  console.log(
    `\nWeb com SQLite habilitado em http://localhost:${publicPort}\n` +
      `(Metro roda em ${metroPort}; o proxy adiciona COOP/COEP)\n`,
  );
});

async function waitForMetro() {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    if (await canConnect()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`Metro nao subiu na porta ${metroPort}.`);
}

function canConnect() {
  return new Promise((resolve) => {
    const probe = net.connect(metroPort, metroHost);

    probe.on('connect', () => {
      probe.destroy();
      resolve(true);
    });
    probe.on('error', () => {
      probe.destroy();
      resolve(false);
    });
  });
}
