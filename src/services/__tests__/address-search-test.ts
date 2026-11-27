import { reverseAddress, searchAddresses } from '../address-search';

describe('Photon calls (specs 019, 029, D19)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: false });
    globalThis.fetch = fetchMock;
  });

  const agentOf = (call: unknown[] | undefined) => {
    const init = call?.[1] as RequestInit;
    return (init.headers as Record<string, string>)['User-Agent'];
  };

  test('the search names the app, since Photon refuses the default Android client', async () => {
    await searchAddresses('gare de lyon', new AbortController().signal);

    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/^https:\/\/photon\.komoot\.io\/api\//);
    expect(agentOf(fetchMock.mock.calls[0])).toBe('YallaMap/1.0 (otakumi.factory@gmail.com)');
  });

  test('the reverse lookup for the help card names the app too', async () => {
    await reverseAddress([2.35, 48.85]);

    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/^https:\/\/photon\.komoot\.io\/reverse/);
    expect(agentOf(fetchMock.mock.calls[0])).toBe('YallaMap/1.0 (otakumi.factory@gmail.com)');
  });

  test('a refused answer still reads as no network for the companion', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(searchAddresses('gare de lyon', new AbortController().signal)).resolves.toEqual({
      ok: false,
      reason: 'offline',
    });
  });
});
