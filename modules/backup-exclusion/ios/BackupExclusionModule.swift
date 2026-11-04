import ExpoModulesCore

// Spec 016 (D1): the app's files never leave the phone, not even in an iCloud or computer
// backup. Marking a folder excluded covers everything inside it. Caches and tmp are never
// backed up by iOS; Documents (places, photos) and Application Support (the map's tile
// cache, which tells the area looked at) are excluded here.
public class BackupExclusionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BackupExclusion")

    // At every start, before any JavaScript call.
    OnCreate {
      _ = BackupExclusionModule.excludeAppData()
    }

    // True once every folder of the app's data is excluded from backups.
    Function("excludeAppDataFromBackup") { () -> Bool in
      return BackupExclusionModule.excludeAppData()
    }
  }

  static func excludeAppData() -> Bool {
    let manager = FileManager.default
    var excluded = true
    for directory in [FileManager.SearchPathDirectory.documentDirectory, .applicationSupportDirectory] {
      guard var url = manager.urls(for: directory, in: .userDomainMask).first else {
        excluded = false
        continue
      }
      do {
        try manager.createDirectory(at: url, withIntermediateDirectories: true)
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        try url.setResourceValues(values)
      } catch {
        excluded = false
      }
    }
    return excluded
  }
}
