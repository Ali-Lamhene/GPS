import { File, Paths } from 'expo-file-system';

import { excludeAppDataFromBackup } from './backup-exclusion';

// Spec 015: the traveller's places live in one file of the app's private documents folder,
// readable by this app only and kept out of Google backups (`allowBackup: false`).

const MAIN = 'places.json';
const TEMPORARY = 'places.json.tmp';
const BACKUP = 'places.json.bak';
/** A file this version cannot read (from a newer version, or damaged), kept once, never lost. */
const UNREADABLE = 'places.unreadable.json';

export type SaveResult = { ok: true } | { ok: false };

const file = (name: string) => new File(Paths.document, name);

/**
 * The texts of the places files, the one to trust first: the file itself, then the new one
 * not yet moved in place, then the previous one. A save cut halfway leaves one of them whole.
 */
export async function readPlacesFiles(): Promise<string[]> {
  // Spec 016: the whole documents folder stays out of backups, checked at every start.
  excludeAppDataFromBackup();
  const texts: string[] = [];
  for (const name of [MAIN, TEMPORARY, BACKUP]) {
    try {
      const candidate = file(name);
      if (candidate.exists) texts.push(await candidate.text());
    } catch {
      // An unreadable copy is skipped; the next one may be whole. Nothing goes to the logs.
    }
  }
  return texts;
}

/**
 * Deletes the backup copy, once the places file is in place and whole (spec 022): after a
 * deletion, the backup still held the deleted place.
 */
export async function dropPlacesBackup(): Promise<SaveResult> {
  try {
    const backup = file(BACKUP);
    if (backup.exists) backup.delete();
    return { ok: !file(BACKUP).exists };
  } catch {
    return { ok: false };
  }
}

/** Keeps a copy of a places file this version cannot read, before anything writes over it. */
export async function keepUnreadablePlacesFile(): Promise<void> {
  try {
    const kept = file(UNREADABLE);
    const main = file(MAIN);
    if (main.exists && !kept.exists) await main.copy(kept);
  } catch {
    // Best effort: without the copy, the places are still read from the backup if any.
  }
}

/**
 * Replaces the places file: the new text goes to a temporary file, the old file becomes the
 * backup, then the temporary file takes its place. Killed at any point, one copy stays whole.
 */
export async function writePlacesFile(text: string): Promise<SaveResult> {
  const temporary = file(TEMPORARY);
  excludeAppDataFromBackup();
  try {
    await temporary.write(text);
    const main = file(MAIN);
    if (main.exists) await main.move(file(BACKUP), { overwrite: true });
    await temporary.move(file(MAIN), { overwrite: true });
    return { ok: true };
  } catch {
    // A temporary copy of the places is not left behind (securite.md §4).
    try {
      if (temporary.exists) temporary.delete();
    } catch {
      // Nothing more to do: the backup still holds the previous places.
    }
    return { ok: false };
  }
}
