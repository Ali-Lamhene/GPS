import { keepUnreadablePlacesFile, readPlacesFiles, writePlacesFile } from '../place-storage';

// An in-memory documents folder, with a way to make one step fail.
const mockDisk = new Map<string, string>();
const mockFailures: { write?: boolean; move?: string } = {};

jest.mock('expo-file-system', () => {
  class File {
    name: string;
    constructor(_directory: unknown, name: string) {
      this.name = name;
    }
    get exists() {
      return mockDisk.has(this.name);
    }
    async text() {
      const text = mockDisk.get(this.name);
      if (text === undefined) throw new Error('missing');
      return text;
    }
    async write(text: string) {
      if (mockFailures.write) throw new Error('mockDisk full');
      mockDisk.set(this.name, text);
    }
    async move(destination: File) {
      if (mockFailures.move === this.name) throw new Error('cut');
      const text = mockDisk.get(this.name);
      if (text === undefined) throw new Error('missing');
      mockDisk.delete(destination.name);
      mockDisk.delete(this.name);
      mockDisk.set(destination.name, text);
    }
    async copy(destination: File) {
      const text = mockDisk.get(this.name);
      if (text !== undefined) mockDisk.set(destination.name, text);
    }
    delete() {
      mockDisk.delete(this.name);
    }
  }
  return { File, Paths: { document: 'documents' } };
});

describe('place storage (spec 015)', () => {
  beforeEach(() => {
    mockDisk.clear();
    delete mockFailures.write;
    delete mockFailures.move;
  });

  test('a save replaces the file and keeps the previous one as backup', async () => {
    mockDisk.set('places.json', 'old');

    expect(await writePlacesFile('new')).toEqual({ ok: true });

    expect(mockDisk.get('places.json')).toBe('new');
    expect(mockDisk.get('places.json.bak')).toBe('old');
    expect(mockDisk.has('places.json.tmp')).toBe(false);
    expect(await readPlacesFiles()).toEqual(['new', 'old']);
  });

  test('a full phone: the save fails, the old file is intact, no temporary copy left', async () => {
    mockDisk.set('places.json', 'old');
    mockFailures.write = true;

    expect(await writePlacesFile('new')).toEqual({ ok: false });

    expect(mockDisk.get('places.json')).toBe('old');
    expect(mockDisk.has('places.json.tmp')).toBe(false);
  });

  test('cut between the backup and the last move: the previous places are still read', async () => {
    mockDisk.set('places.json', 'old');
    mockFailures.move = 'places.json.tmp';

    expect(await writePlacesFile('new')).toEqual({ ok: false });

    expect(mockDisk.has('places.json')).toBe(false);
    expect(await readPlacesFiles()).toEqual(['old']);
  });

  test('an unreadable file is kept aside once, never written over', async () => {
    mockDisk.set('places.json', 'from a newer version');
    await keepUnreadablePlacesFile();
    mockDisk.set('places.json', 'later');
    await keepUnreadablePlacesFile();

    expect(mockDisk.get('places.unreadable.json')).toBe('from a newer version');
  });
});
