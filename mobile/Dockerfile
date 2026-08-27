FROM node:22-alpine

WORKDIR /app

# Install dependencies first so source changes don't invalidate this layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# The proxy the browser talks to; Metro itself stays on 8082 inside.
EXPOSE 8081

# No TTY here to press keys in, and CI=1 would disable Metro's watch mode.
ENV EXPO_NO_TELEMETRY=1

# `npm run web` starts Metro on 8082 behind a proxy on 8081 that adds the
# COOP/COEP headers expo-sqlite needs on the web. See scripts/web-dev-server.mjs.
CMD ["npm", "run", "web"]
