/**
 * Global constants used throughout the application
 */

export const GAME_NAME = 'Slot Machine 5x4' as const;

export const GAME_VERSION = '1.0.0' as const;

export const DEBUG_MODE = import.meta.env.DEV;

export const COLORS = {
  PRIMARY: 0x0f3460,
  SECONDARY: 0x16213e,
  BACKGROUND: 0x1a1a2e,
  ACCENT: 0xe94560,
  SUCCESS: 0x2ecc71,
  WARNING: 0xf39c12,
  ERROR: 0xe74c3c,
  WHITE: 0xffffff,
  BLACK: 0x000000,
} as const;
