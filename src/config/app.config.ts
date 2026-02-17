import type { DeepReadonly } from '@core/types';
import type { GpuPowerPreference } from 'node_modules/pixi.js/lib/rendering/renderers/types';

/**
 * Application-wide configuration
 */

interface PixiConfig {
  readonly backgroundColor: number;
  readonly resolution: number;
  readonly autoDensity: boolean;
  readonly antialias: boolean;
  readonly powerPreference: GpuPowerPreference;
}

interface SlotConfig {
  readonly rows: number;
  readonly cols: number;
  readonly symbolSize: number;
  readonly spacing: number;
}

interface AppConfiguration {
  readonly pixi: PixiConfig;
  readonly slot: SlotConfig;
}

export const APP_CONFIG: DeepReadonly<AppConfiguration> = {
  pixi: {
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio ,
    autoDensity: true,
    antialias: true,
    powerPreference: 'high-performance',
  },
  slot: {
    rows: 4,
    cols: 5,
    symbolSize: 120,
    spacing: 10,
  },
} as const;
