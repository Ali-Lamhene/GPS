// Spec 016: the config plugin that keeps every file of the app out of Android backups and
// direct transfers. The dangerous mod is run against a temporary project folder.
import withNoDataExtraction from '../plugins/with-no-data-extraction';

// Node built-ins, typed here only: the app's TypeScript setup has no Node types.
const fs = jest.requireActual<{
  mkdtempSync(prefix: string): string;
  readFileSync(path: string, encoding: 'utf8'): string;
  rmSync(path: string, options: { recursive: boolean; force: boolean }): void;
}>('fs');
const os = jest.requireActual<{ tmpdir(): string }>('os');
const path = jest.requireActual<{ join(...parts: string[]): string }>('path');

type DangerousMod = (config: { modRequest: { platformProjectRoot: string } }) => Promise<unknown>;

type Manifest = { manifest: { application?: { $: Record<string, string> }[] } };
type ManifestMod = (config: { modResults: Manifest }) => Promise<{ modResults: Manifest }>;

describe('with-no-data-extraction (spec 016)', () => {
  test('writes rules that exclude every domain from cloud backup and device transfer', async () => {
    const config = withNoDataExtraction({ name: 'GPS', slug: 'GPS' }) as {
      mods?: { android?: { dangerous?: DangerousMod } };
    };
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gps-plugin-'));
    const dangerous = config.mods?.android?.dangerous;
    expect(dangerous).toBeDefined();

    await dangerous?.({ modRequest: { platformProjectRoot: root } });

    const rules = fs.readFileSync(
      path.join(root, 'app/src/main/res/xml/no_data_extraction.xml'),
      'utf8',
    );
    for (const section of ['cloud-backup', 'device-transfer']) {
      const body = rules.split(`<${section}>`)[1]?.split(`</${section}>`)[0] ?? '';
      for (const domain of [
        'root',
        'file',
        'database',
        'sharedpref',
        'external',
        'device_root',
        'device_file',
        'device_database',
        'device_sharedpref',
      ]) {
        expect(body).toContain(`<exclude domain="${domain}" path="." />`);
      }
    }
    fs.rmSync(root, { recursive: true, force: true });
  });

  test('points the manifest at these rules and keeps allowBackup off', async () => {
    const config = withNoDataExtraction({ name: 'GPS', slug: 'GPS' }) as {
      mods?: { android?: { manifest?: ManifestMod } };
    };
    const manifest: Manifest = {
      manifest: { application: [{ $: { 'android:allowBackup': 'true' } }] },
    };

    const result = await config.mods?.android?.manifest?.({ modResults: manifest });

    expect(result?.modResults.manifest.application?.[0]?.$).toMatchObject({
      'android:dataExtractionRules': '@xml/no_data_extraction',
      'android:allowBackup': 'false',
    });
  });
});
