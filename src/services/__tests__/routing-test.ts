import { findRoute } from '../routing';

describe('findRoute (spec 021, D19)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: false });
    globalThis.fetch = fetchMock;
  });

  test('names the app by its commercial name only, with a contact, as Transitous asks', async () => {
    await findRoute([5.3806, 43.3027], [5.3834, 43.2944], 'walk', new AbortController().signal);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toMatch(/^https:\/\/api\.transitous\.org\//);
    const agent = (init as RequestInit).headers as Record<string, string>;
    expect(agent['User-Agent']).toBe('Yalla/1.0 (otakumi.factory@gmail.com)');
    // Nothing that leads to what the app is for (D19).
    expect(agent['User-Agent']).not.toMatch(/github|gps|texte/i);
  });
});
