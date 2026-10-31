// Native audio and speech modules have no Jest implementation: replace them with silent
// fakes so screens that play cues or read names can render in tests.
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({ seekTo: jest.fn(() => Promise.resolve()), play: jest.fn() })),
}));

jest.mock('expo-speech', () => ({
  stop: jest.fn(() => Promise.resolve()),
  speak: jest.fn(),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));
