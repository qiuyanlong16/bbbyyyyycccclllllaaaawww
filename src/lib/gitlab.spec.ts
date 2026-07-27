import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateToken } from './gitlab';

const URL_BASE = 'https://gitlab.example.com';

function mockFetch(response: { status: number; body?: unknown } | (() => never)) {
  const fn =
    typeof response === 'function'
      ? vi.fn(response)
      : vi.fn(
          async () =>
            new Response(JSON.stringify(response.body), {
              status: response.status,
              headers: { 'Content-Type': 'application/json' },
            }),
        );
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('validateToken', () => {
  it('returns ok with user on 200 + active', async () => {
    mockFetch({
      status: 200,
      body: { id: 1, username: 'u', name: 'U', email: 'u@e.com', state: 'active', avatar_url: '', web_url: '' },
    });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r.ok).toBe(true);
    expect(r.user?.username).toBe('u');
    expect(global.fetch).toHaveBeenCalledWith(`${URL_BASE}/api/v4/user`, {
      headers: { 'PRIVATE-TOKEN': 'tok' },
    });
  });

  it('returns invalid on 401', async () => {
    mockFetch({ status: 401, body: { message: '401' } });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'invalid' });
  });

  it('returns forbidden on 403', async () => {
    mockFetch({ status: 403, body: { message: '403' } });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'forbidden' });
  });

  it('returns inactive when state != active', async () => {
    mockFetch({
      status: 200,
      body: { id: 1, username: 'u', name: 'U', email: '', state: 'blocked', avatar_url: '', web_url: '' },
    });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'inactive' });
  });

  it('returns network on fetch throw', async () => {
    mockFetch(() => {
      throw new TypeError('Failed to fetch');
    });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'network' });
  });

  it('returns unknown on other non-ok', async () => {
    mockFetch({ status: 500, body: {} });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'unknown' });
  });
});
