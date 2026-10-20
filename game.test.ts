import { describe, it, expect } from 'vitest';
import { clamp, shuffle, formatTime, degToRad, radToDeg, createSeededRandom, randomInt } from './utils';
import { CONFIG, getConfig } from './constants';

describe('Utility Helpers', () => {
  it('clamp restricts values to min and max', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('formatTime correctly formats seconds to mm:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3599)).toBe('59:59');
  });

  it('degToRad and radToDeg convert correctly', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
    expect(radToDeg(Math.PI)).toBeCloseTo(180);
  });

  it('createSeededRandom produces deterministic values', () => {
    const rng1 = createSeededRandom(12345);
    const rng2 = createSeededRandom(12345);
    expect(rng1()).toEqual(rng2());
    expect(rng1()).toEqual(rng2());
  });

  it('shuffle returns an array with identical elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('randomInt stays within range', () => {
    for (let i = 0; i < 50; i++) {
      const val = randomInt(1, 5);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
    }
  });
});

describe('Game Configuration', () => {
  it('retrieves config values correctly', () => {
    expect(getConfig('baseCanvasWidth')).toBe(1376);
    expect(getConfig('baseCanvasHeight')).toBe(768);
    expect(getConfig('title')).toBe('Tape Cipher');
  });

  it('CONFIG contains expected entries', () => {
    expect(CONFIG.targetFPS.value).toBe(60);
    expect(CONFIG.backgroundColor.value).toBe('#1a120b');
  });
});
