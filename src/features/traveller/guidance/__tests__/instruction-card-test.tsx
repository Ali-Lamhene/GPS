import { render } from '@testing-library/react-native';

import { GLYPHS } from '@/ui/icon/glyphs';

import { InstructionCard } from '../instruction-card';

const LAST_WALK = { kind: 'walkToDestination' } as const;
const school = { id: 'school', icon: 'school', photo: 'file:///school.jpg' } as const;
const beach = { id: 'beach', icon: 'beach_access' } as const;

describe('<InstructionCard /> arrival (spec 036)', () => {
  test('on the last walk, the place to reach shows its photo', async () => {
    const screen = await render(<InstructionCard instruction={LAST_WALK} destination={school} />);

    expect(JSON.stringify(screen.toJSON())).toContain('file:///school.jpg');
  });

  test('without a photo, the place keeps its pictogram', async () => {
    const screen = await render(<InstructionCard instruction={LAST_WALK} destination={beach} />);

    const tree = JSON.stringify(screen.toJSON());
    expect(tree).not.toContain('file://');
    expect(tree).toContain(String.fromCodePoint(GLYPHS.beach_access));
  });
});
