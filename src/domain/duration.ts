// A duration is shown as dials, never as digits (docs/screens.md, rule 7): one full dial
// per hour, then a partial dial filled in proportion to the real remaining minutes.
// 35 minutes = one dial filled to 35/60, 75 minutes = one full dial and one at 15/60.

/** Fill of each dial, from 0 (empty) to 1 (full). Always at least one dial. */
export function dialFills(minutes: number): number[] {
  const rounded = Math.max(0, Math.round(minutes));
  const fullHours = Math.floor(rounded / 60);
  const rest = rounded % 60;

  const fills: number[] = Array.from({ length: fullHours }, () => 1);
  if (rest > 0 || fills.length === 0) fills.push(rest / 60);
  return fills;
}
