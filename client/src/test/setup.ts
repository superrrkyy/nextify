import '@testing-library/jest-dom';

// Mock Audio
global.Audio = class MockAudio {
  src = '';
  currentTime = 0;
  duration = 200;
  volume = 1;
  paused = true;
  play = () => Promise.resolve();
  pause = () => {};
  load = () => {};
  addEventListener = () => {};
  removeEventListener = () => {};
} as any;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;
