import { requireOptionalNativeModule } from 'expo';

type BackupExclusionModule = {
  excludeAppDataFromBackup(): boolean;
};

/**
 * The iOS module that keeps the app's data out of backups (spec 016). Undefined on Android
 * and in a build made before the module existed.
 */
export const BackupExclusion =
  requireOptionalNativeModule<BackupExclusionModule>('BackupExclusion') ?? undefined;
