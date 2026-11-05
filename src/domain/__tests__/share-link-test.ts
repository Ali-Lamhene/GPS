import { decodeShareLink, encodeShareLink, findSamePlace, SHARE_LINK_BASE } from '../share-link';

describe('share link (spec 001)', () => {
  const hospital = { point: [5.37722, 43.29655] as const, icon: 'local_hospital' as const };

  test('carries the point and the pictogram after #, nothing else', () => {
    const link = encodeShareLink(hospital);

    expect(link).toBe(`${SHARE_LINK_BASE}#1/43.29655/5.37722/local_hospital`);
    expect(decodeShareLink(link)).toEqual({ ok: true, place: hospital });
  });

  test('reads the page with or without its final slash, nothing close to it', () => {
    const hash = '#1/43.29655/5.37722/local_hospital';
    const page = 'https://ali-lamhene.github.io/gps/lieu';

    expect(SHARE_LINK_BASE).toBe(`${page}/`);
    expect(decodeShareLink(`${page}${hash}`)).toEqual({ ok: true, place: hospital });
    expect(decodeShareLink(`${page}/${hash}`)).toEqual({ ok: true, place: hospital });
    for (const lookalike of [`${page}x${hash}`, `${page}//${hash}`, `${page}/x${hash}`]) {
      expect(decodeShareLink(lookalike)).toEqual({ ok: false, reason: 'not-a-place-link' });
    }
  });

  test('rounds to about a metre', () => {
    const link = encodeShareLink({ point: [5.377221234, 43.296551234], icon: 'school' });

    expect(link.endsWith('#1/43.29655/5.37722/school')).toBe(true);
  });

  test.each([
    ['another site', 'https://evil.example/gps/lieu#1/43.29655/5.37722/school'],
    ['too long', `${SHARE_LINK_BASE}#1/43.29655/5.37722/${'x'.repeat(300)}`],
  ])('refuses %s', (_, url) => {
    expect(decodeShareLink(url)).toEqual({ ok: false, reason: 'not-a-place-link' });
  });

  test('a link of a future version is not read', () => {
    expect(decodeShareLink(`${SHARE_LINK_BASE}#2/43.29655/5.37722/school`)).toEqual({
      ok: false,
      reason: 'unknown-version',
    });
  });

  test.each([
    ['characters removed', `${SHARE_LINK_BASE}#1/43.2965/5.3772`],
    ['out of bounds', `${SHARE_LINK_BASE}#1/95.00000/5.37722/school`],
    ['not a number', `${SHARE_LINK_BASE}#1/43.2x655/5.37722/school`],
    ['unknown pictogram', `${SHARE_LINK_BASE}#1/43.29655/5.37722/rocket_launch`],
    ['script', `${SHARE_LINK_BASE}#1/43.29655/5.37722/<script>`],
    ['empty', `${SHARE_LINK_BASE}#`],
    ['extra parts', `${SHARE_LINK_BASE}#1/43.29655/5.37722/school/home`],
  ])('a damaged link (%s) adds nothing', (_, url) => {
    expect(decodeShareLink(url).ok).toBe(false);
  });

  test('the same link twice gives no duplicate: same pictogram within 15 m', () => {
    const kept = [
      { id: 'p1', icon: 'local_hospital' as const, point: [5.3773, 43.29656] as const },
    ];

    expect(findSamePlace(kept, hospital)).toBe(kept[0]);
    expect(findSamePlace(kept, { ...hospital, icon: 'school' })).toBeUndefined();
    expect(findSamePlace(kept, { ...hospital, point: [5.38, 43.3] })).toBeUndefined();
  });
});
