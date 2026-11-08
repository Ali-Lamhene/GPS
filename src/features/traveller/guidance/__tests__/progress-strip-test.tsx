import { render, screen } from '@testing-library/react-native';

import { doneDots, PROGRESS_DOTS, ProgressStrip } from '../progress-strip';

describe('<ProgressStrip /> (specs 010, 027)', () => {
  test('dots fill as the traveller moves on', async () => {
    await render(<ProgressStrip progress={0.5} />);

    expect(screen.getAllByTestId('dot-done')).toHaveLength(PROGRESS_DOTS / 2);
    expect(screen.getAllByTestId('dot-left')).toHaveLength(PROGRESS_DOTS / 2);
  });

  test('a first step of the way already fills a dot, the arrival fills them all', () => {
    expect(doneDots(0)).toBe(0);
    expect(doneDots(0.05)).toBe(1);
    expect(doneDots(1)).toBe(PROGRESS_DOTS);
    expect(doneDots(1.4)).toBe(PROGRESS_DOTS);
  });
});
