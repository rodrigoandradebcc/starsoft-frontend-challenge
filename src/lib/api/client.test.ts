import { ApiError, apiFetch } from './client';

describe('apiFetch', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns JSON for a successful request', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    await expect(apiFetch('/ping')).resolves.toEqual({ ok: true });
  });

  it('exposes the status and API message on failure', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ message: 'Inválido' }), { status: 400 }));
    await expect(apiFetch('/ping')).rejects.toEqual(new ApiError(400, 'Inválido'));
  });
});
