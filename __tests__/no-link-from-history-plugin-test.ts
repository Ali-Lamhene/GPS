// Spec 022: the config plugin that drops an old link re-delivered from the recent apps.
import withNoLinkFromHistory from '../plugins/with-no-link-from-history';

type Activity = { language: string; contents: string };
type ActivityMod = (config: { modResults: Activity }) => Promise<{ modResults: Activity }>;

const MAIN_ACTIVITY = `package org.gpssanstexte.app
class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.AppTheme);
    super.onCreate(null)
  }
}
`;

describe('with-no-link-from-history (spec 022)', () => {
  test('clears the link at the start of onCreate, once', async () => {
    const config = withNoLinkFromHistory({ name: 'GPS', slug: 'GPS' }) as {
      mods?: { android?: { mainActivity?: ActivityMod } };
    };
    const mod = config.mods?.android?.mainActivity;

    const once = await mod?.({ modResults: { language: 'kt', contents: MAIN_ACTIVITY } });
    const twice = await mod?.({ modResults: once?.modResults ?? { language: 'kt', contents: '' } });

    const contents = twice?.modResults.contents ?? '';
    expect(contents.match(/FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY/g)).toHaveLength(1);
    expect(contents.indexOf('intent.data = null')).toBeLessThan(contents.indexOf('super.onCreate'));
    // A recreated activity (text size, language) drops it too.
    expect(contents).toContain('savedInstanceState != null');
  });
});
