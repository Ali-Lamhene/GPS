// Spec 015, development in the browser: the same places file, kept in the browser's storage.

const KEY = 'gps.places';

export type SaveResult = { ok: true } | { ok: false };

export async function readPlacesFiles(): Promise<string[]> {
  try {
    const text = window.localStorage.getItem(KEY);
    return text === null ? [] : [text];
  } catch {
    // Storage blocked (private window): reads as no place (spec 015).
    return [];
  }
}

export async function dropPlacesBackup(): Promise<SaveResult> {
  // No backup copy in the browser.
  return { ok: true };
}

export async function keepUnreadablePlacesFile(): Promise<void> {
  // The browser is for development only: an unreadable entry is simply written over.
}

export async function writePlacesFile(text: string): Promise<SaveResult> {
  try {
    window.localStorage.setItem(KEY, text);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
