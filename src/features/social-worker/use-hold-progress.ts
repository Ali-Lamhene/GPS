import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Progress of a long press, from 0 to 1 over `durationMs`. Calls `onComplete` once full;
 * releasing early resets it. Hides the companion area from a traveller's casual touch (D8).
 */
export function useHoldProgress(durationMs: number, onComplete: () => void) {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    const startedAt = Date.now();
    const tick = () => {
      const elapsed = Math.min(1, (Date.now() - startedAt) / durationMs);
      if (elapsed >= 1) {
        frame.current = null;
        setProgress(0);
        onComplete();
        return;
      }
      setProgress(elapsed);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [durationMs, onComplete, stop]);

  const cancel = useCallback(() => {
    stop();
    setProgress(0);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { progress, start, cancel };
}
