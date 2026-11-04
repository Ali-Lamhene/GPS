// Spec 016 (D1): on Android 12 and later, `allowBackup: false` stops the Google backup but
// not the direct transfer to a new phone. These rules keep every file of the app out of both.
const fs = require('fs');
const path = require('path');
const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');

const RULES_NAME = 'no_data_extraction';
// The device-protected domains (Direct Boot) are not covered by `root`: excluded too.
const DOMAINS = [
  'root',
  'file',
  'database',
  'sharedpref',
  'external',
  'device_root',
  'device_file',
  'device_database',
  'device_sharedpref',
];

const excludeAll = DOMAINS.map((domain) => `    <exclude domain="${domain}" path="." />`).join(
  '\n',
);
const RULES = `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
  <cloud-backup>
${excludeAll}
  </cloud-backup>
  <device-transfer>
${excludeAll}
  </device-transfer>
</data-extraction-rules>
`;

const withRulesFile = (config) =>
  withDangerousMod(config, [
    'android',
    async (config) => {
      const directory = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      await fs.promises.mkdir(directory, { recursive: true });
      await fs.promises.writeFile(path.join(directory, `${RULES_NAME}.xml`), RULES);
      return config;
    },
  ]);

const withRulesInManifest = (config) =>
  withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) throw new Error('with-no-data-extraction: no <application> in the manifest');
    application.$['android:dataExtractionRules'] = `@xml/${RULES_NAME}`;
    application.$['android:allowBackup'] = 'false';
    return config;
  });

module.exports = (config) => withRulesInManifest(withRulesFile(config));
