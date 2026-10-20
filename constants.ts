import {SpriteConfig} from './utils/helper';

/**
 * Configuration for Tape Cipher.
 */
export const CONFIG = {
  title: {
    value: 'Tape Cipher',
    type: 'string',
    label: 'Game Title',
    group: 'GAME',
  },
  baseCanvasWidth: {
    value: 1376,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'GAME',
  },
  baseCanvasHeight: {
    value: 768,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'GAME',
  },

  // System Constants
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'SYSTEM',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'SYSTEM',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'SYSTEM',
  },

  // Theme
  backgroundColor: {
    value: '#1a120b',
    type: 'color',
    label: 'Background Color',
    group: 'THEME',
  },
  primaryColor: {
    value: '#d97706',
    type: 'color',
    label: 'Primary Amber Color',
    group: 'THEME',
  },
  fontFamily: {
    value: 'Georgia, serif',
    type: 'string',
    label: 'Font Family',
    group: 'THEME',
  },

  // Audio Levels
  defaultMusicVolume: {
    value: 0.5,
    type: 'number',
    label: 'Default Music Volume',
    group: 'AUDIO',
  },
  defaultSfxVolume: {
    value: 0.6,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'AUDIO',
  },

  // Gameplay & Word Rules
  maxFractures: {
    value: 6,
    type: 'number',
    label: 'Max Tape Fractures',
    group: 'Rules',
  },
  totalChapters: {
    value: 20,
    type: 'number',
    label: 'Total Chapters',
    group: 'Rules',
  },
  baseScorePerCorrect: {
    value: 150,
    type: 'number',
    label: 'Base Score Per Word',
    group: 'Rules',
  },
  streakBonus: {
    value: 25,
    type: 'number',
    label: 'Streak Bonus Score',
    group: 'Rules',
  },
  initialFlux: {
    value: 3,
    type: 'number',
    label: 'Initial Audio Flux',
    group: 'Rules',
  },
  fluxCostPerHint: {
    value: 1,
    type: 'number',
    label: 'Flux Cost Per Hint',
    group: 'Rules',
  },
  spoolRotationSpeed: {
    value: 1.5,
    type: 'number',
    label: 'Spool Rotation Speed',
    group: 'Visuals',
  },

  // Asset configurations from read_assets_metadata
  assetBgTableWidth: {
    value: 1376,
    type: 'number',
    label: 'Deck Table Width',
    group: 'ASSETS',
  },
  assetBgTableHeight: {
    value: 768,
    type: 'number',
    label: 'Deck Table Height',
    group: 'ASSETS',
  },
  assetBgTableAspectRatio: {
    value: 1376 / 768,
    type: 'number',
    label: 'Deck Table Aspect Ratio',
    group: 'ASSETS',
  },

  assetParchmentWidth: {
    value: 874,
    type: 'number',
    label: 'Parchment Width',
    group: 'ASSETS',
  },
  assetParchmentHeight: {
    value: 679,
    type: 'number',
    label: 'Parchment Height',
    group: 'ASSETS',
  },
  assetParchmentAspectRatio: {
    value: 874 / 679,
    type: 'number',
    label: 'Parchment Aspect Ratio',
    group: 'ASSETS',
  },

  assetVignetteWidth: {
    value: 857,
    type: 'number',
    label: 'Vignette Width',
    group: 'ASSETS',
  },
  assetVignetteHeight: {
    value: 852,
    type: 'number',
    label: 'Vignette Height',
    group: 'ASSETS',
  },
  assetVignetteAspectRatio: {
    value: 857 / 852,
    type: 'number',
    label: 'Vignette Aspect Ratio',
    group: 'ASSETS',
  },

  assetWardenWidth: {
    value: 722,
    type: 'number',
    label: 'Tape Warden Width',
    group: 'ASSETS',
  },
  assetWardenHeight: {
    value: 722,
    type: 'number',
    label: 'Tape Warden Height',
    group: 'ASSETS',
  },
  assetWardenAspectRatio: {
    value: 722 / 722,
    type: 'number',
    label: 'Tape Warden Aspect Ratio',
    group: 'ASSETS',
  },

  assetSpoolWidth: {
    value: 786,
    type: 'number',
    label: 'Spool Assembly Width',
    group: 'ASSETS',
  },
  assetSpoolHeight: {
    value: 782,
    type: 'number',
    label: 'Spool Assembly Height',
    group: 'ASSETS',
  },
  assetSpoolAspectRatio: {
    value: 786 / 782,
    type: 'number',
    label: 'Spool Assembly Aspect Ratio',
    group: 'ASSETS',
  },

  assetMeterWidth: {
    value: 801,
    type: 'number',
    label: 'Tension Meter Width',
    group: 'ASSETS',
  },
  assetMeterHeight: {
    value: 720,
    type: 'number',
    label: 'Tension Meter Height',
    group: 'ASSETS',
  },
  assetMeterAspectRatio: {
    value: 801 / 720,
    type: 'number',
    label: 'Tension Meter Aspect Ratio',
    group: 'ASSETS',
  },
};

// Merge customized config values if present (injected by Playground)
const {playgroundConfig} = globalThis as {
  playgroundConfig?: Record<string, unknown>;
};
if (playgroundConfig) {
  for (const [key, value] of Object.entries(playgroundConfig)) {
    if (key in CONFIG) {
      Object.assign(CONFIG[key as keyof typeof CONFIG], {value});
    }
  }
}

/**
 * Type helper for reading values in game code
 */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * @param key The configuration key.
 * @return The configuration value.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  return CONFIG[key].value;
}
