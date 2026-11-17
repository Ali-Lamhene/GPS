import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CURRENT_POSITION, type Place } from '@/domain/place';
import { GLYPHS } from '@/ui/icon/glyphs';

import { ProgressPanel } from '../progress-panel';

const BEACH: Place = { id: 'beach', icon: 'beach_access', helpName: 'la plage' };
const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

// Pictograms are hidden from screen readers: the disc carries the label.
const hidden = { includeHiddenElements: true };

describe('<ProgressPanel /> (spec 027)', () => {
  test('a trip from « here » shows a plain start, never the pin of « me »', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ProgressPanel
          origin={CURRENT_POSITION}
          destination={BEACH}
          progress={0.5}
          remainingMinutes={10}
        />
      </SafeAreaProvider>,
    );

    expect(screen.queryByText(String.fromCodePoint(GLYPHS.person_pin_circle), hidden)).toBeNull();
    expect(
      screen.getAllByText(String.fromCodePoint(GLYPHS.location_on), hidden).length,
    ).toBeGreaterThan(0);
  });
});

describe('<ProgressPanel /> photos (spec 036)', () => {
  const SCHOOL: Place = { id: 'school', icon: 'school', photo: 'file:///school.jpg' };
  const HOME: Place = { id: 'home', icon: 'home', photo: 'file:///home.jpg' };

  test('the start and arrival ends show the photo of their place', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ProgressPanel origin={HOME} destination={SCHOOL} progress={0.5} remainingMinutes={10} />
      </SafeAreaProvider>,
    );

    const tree = JSON.stringify(screen.toJSON());
    expect(tree).toContain('file:///home.jpg');
    expect(tree).toContain('file:///school.jpg');
  });

  test('a place without a photo shows no picture', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ProgressPanel origin={BEACH} destination={BEACH} progress={0.5} remainingMinutes={10} />
      </SafeAreaProvider>,
    );

    expect(JSON.stringify(screen.toJSON())).not.toContain('file://');
  });
});
