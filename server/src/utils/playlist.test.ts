import { describe, it, expect } from 'vitest';

// Unit tests for playlist logic, shuffle, repeat
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getNextIndex(current: number, length: number, shuffle: boolean, repeat: 'off' | 'all' | 'one'): number {
  if (repeat === 'one') return current;
  if (shuffle) {
    // In shuffle, return random not current
    if (length <= 1) return 0;
    let next;
    do {
      next = Math.floor(Math.random() * length);
    } while (next === current);
    return next;
  }
  const next = current + 1;
  if (next >= length) {
    return repeat === 'all' ? 0 : -1;
  }
  return next;
}

describe('Playlist logic', () => {
  it('should shuffle array without losing elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled).toHaveLength(arr.length);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('should get next index correctly', () => {
    expect(getNextIndex(0, 5, false, 'off')).toBe(1);
    expect(getNextIndex(4, 5, false, 'off')).toBe(-1);
    expect(getNextIndex(4, 5, false, 'all')).toBe(0);
    expect(getNextIndex(2, 5, false, 'one')).toBe(2);
  });

  it('should handle shuffle next', () => {
    const next = getNextIndex(0, 5, true, 'off');
    expect(next).toBeGreaterThanOrEqual(0);
    expect(next).toBeLessThan(5);
    expect(next).not.toBe(0);
  });

  it('should format duration', () => {
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3600)).toBe('60:00');
  });
});

describe('Auth utilities', () => {
  it('should validate email format', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });

  it('should validate password strength', () => {
    const isStrongPassword = (pwd: string) => pwd.length >= 8;
    expect(isStrongPassword('password123')).toBe(true);
    expect(isStrongPassword('short')).toBe(false);
  });
});

describe('Download authorization', () => {
  it('should only allow download when flag is true', () => {
    const canDownload = (track: { downloadAllowed: boolean }) => track.downloadAllowed === true;
    expect(canDownload({ downloadAllowed: true })).toBe(true);
    expect(canDownload({ downloadAllowed: false })).toBe(false);
  });

  it('should generate safe filename', () => {
    const safeFilename = (title: string) => `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
    expect(safeFilename('My Song!')).toBe('My_Song_.mp3');
    expect(safeFilename('Test/Track')).toBe('Test_Track.mp3');
  });
});
