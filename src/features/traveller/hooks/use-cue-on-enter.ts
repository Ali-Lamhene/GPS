import { useEffect } from 'react';

import { playCue, type Cue } from '@/services/feedback';

/** Plays the cue of a screen or step when it appears. */
export function useCueOnEnter(cue: Cue | undefined) {
  useEffect(() => {
    if (cue) playCue(cue);
  }, [cue]);
}
