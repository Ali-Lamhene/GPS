// Spec 022 (security review of spec 019): Android re-delivers the link that opened the app
// when it is reopened from the recent apps after the system killed it. With deletion, a
// place deleted to hide it would come back by itself. The link is dropped in that case.
const { withMainActivity } = require('expo/config-plugins');

const MARK = 'FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY';
// Also when Android recreates the activity (text size, language, « don't keep activities »):
// its first intent still carries the link.
const GUARD = `    // Spec 022: an old link, re-delivered from the recent apps or to a recreated activity,
    // is never read again.
    if (savedInstanceState != null ||
        (intent.flags and android.content.Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0) {
      intent.data = null
    }
`;

module.exports = (config) =>
  withMainActivity(config, (config) => {
    const activity = config.modResults;
    if (activity.language !== 'kt') {
      throw new Error('with-no-link-from-history: MainActivity is not in Kotlin');
    }
    if (activity.contents.includes(MARK)) return config;
    const onCreate = /override fun onCreate\(savedInstanceState: Bundle\?\) \{\n/;
    if (!onCreate.test(activity.contents)) {
      throw new Error('with-no-link-from-history: onCreate not found in MainActivity');
    }
    activity.contents = activity.contents.replace(onCreate, (found) => found + GUARD);
    return config;
  });
