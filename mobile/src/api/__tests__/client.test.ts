import { requestJson } from '../client';

function respondWith(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

async function errorMessageFor(status: number, body: unknown) {
  respondWith(status, body);
  const result = await requestJson('/profile', { token: null });

  if (result.ok) {
    throw new Error('expected a failed request');
  }

  return result.error.message;
}

describe('requestJson error messages', () => {
  it('shows the first validation message of the fields', async () => {
    await expect(
      errorMessageFor(422, {
        message: 'O campo nome é obrigatório. (and 1 more error)',
        errors: { name: ['O campo nome é obrigatório.'], email: ['O campo e-mail é obrigatório.'] },
      }),
    ).resolves.toBe('O campo nome é obrigatório.');
  });

  it('keeps a Portuguese message sent by the API', async () => {
    await expect(errorMessageFor(403, { message: 'Seu acesso foi bloqueado.' })).resolves.toBe(
      'Seu acesso foi bloqueado.',
    );
  });

  it('replaces technical or English messages with a generic one', async () => {
    await expect(
      errorMessageFor(404, { message: 'No query results for model [App\\Models\\User] 9' }),
    ).resolves.toBe('Não foi possível concluir a solicitação. Tente novamente em instantes.');
  });

  it('never shows details of a server error', async () => {
    await expect(
      errorMessageFor(500, { message: 'SQLSTATE[23505]: Unique violation' }),
    ).resolves.toBe('Ocorreu um erro inesperado no servidor. Tente novamente em instantes.');
  });

  it('explains a network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await requestJson('/profile', { token: null });

    expect(result.ok ? null : result.error.message).toBe(
      'Não foi possível conectar ao servidor. Verifique a internet e tente novamente.',
    );
  });
});
