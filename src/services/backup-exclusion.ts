// Outside src/: a local native module (spec 016), autolinked from modules/.
import { BackupExclusion } from '../../modules/backup-exclusion';

/**
 * Spec 016 (D1): keeps the app's data folders out of iCloud and computer backups. The
 * module already does it at every start; this call checks again before a save. Does nothing
 * on Android, where the manifest rules exclude every file, and in a build made before the
 * native module existed.
 */
export function excludeAppDataFromBackup(): void {
  try {
    BackupExclusion?.excludeAppDataFromBackup();
  } catch {
    // Best effort: the module also excludes the folders when the app starts.
  }
}
