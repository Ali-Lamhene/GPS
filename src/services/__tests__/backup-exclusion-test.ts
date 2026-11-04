import { excludeAppDataFromBackup } from '../backup-exclusion';

jest.mock('../../../modules/backup-exclusion', () => ({ BackupExclusion: undefined }));

describe('excludeFromBackup (spec 016)', () => {
  test('does nothing, and never throws, without the native module', () => {
    expect(() => excludeAppDataFromBackup()).not.toThrow();
  });
});
