import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { Container, Graphics } from 'pixi.js';

export type WinTier = 'total' | 'mega' | 'superMega';

interface TierConfig {
  readonly skeleton: string;
  readonly atlas: string;
  readonly animation: string;
}

const TIER_CONFIGS: Record<WinTier, TierConfig> = {
  total: { skeleton: 'totalWinSkeleton', atlas: 'totalWinAtlas', animation: 'Total_Win' },
  mega: { skeleton: 'megaWinSkeleton', atlas: 'megaWinAtlas', animation: 'Mega_Win' },
  superMega: { skeleton: 'superMegaWinSkeleton', atlas: 'superMegaWinAtlas', animation: 'Super_Mega_Win' },
};

export class WinCelebration extends Container {
  private spine: Spine | null = null;
  private overlay: Graphics | null = null;

  /**
   * Play a win celebration overlay.
   * Returns a Promise that resolves when the user clicks to dismiss.
   */
  public async play(tier: WinTier, screenWidth: number, screenHeight: number): Promise<void> {
    this.stop();

    const config = TIER_CONFIGS[tier];

    // Semi-transparent click-capture overlay behind the spine
    const overlay = new Graphics();
    overlay.rect(0, 0, screenWidth, screenHeight);
    overlay.fill({ color: 0x000000, alpha: 0.4 });
    overlay.eventMode = 'static';
    overlay.cursor = 'pointer';
    this.overlay = overlay;
    this.addChild(overlay);

    const spine = Spine.from({
      skeleton: config.skeleton,
      atlas: config.atlas,
    });

    this.spine = spine;

    // Measure original (unscaled) bounds and set pivot to its center
    const bounds = spine.getBounds();
    spine.pivot.set(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );

    // Scale to fit ~60% of screen, preserving aspect ratio
    const scaleX = (screenWidth * 0.6) / bounds.width;
    const scaleY = (screenHeight * 0.6) / bounds.height;
    spine.scale.set(Math.min(scaleX, scaleY));

    // Place exactly at screen center
    spine.x = screenWidth / 2;
    spine.y = screenHeight / 2;

    this.addChild(spine);

    // Play animation looping so it stays visible until dismissed
    spine.state.setAnimation(0, config.animation, true);

    // Wait for user click to dismiss
    await new Promise<void>((resolve) => {
      overlay.on('pointerdown', () => {
        this.stop();
        resolve();
      });
    });
  }

  public stop(): void {
    if (this.spine) {
      this.removeChild(this.spine);
      this.spine.destroy();
      this.spine = null;
    }

    if (this.overlay) {
      this.overlay.removeAllListeners();
      this.removeChild(this.overlay);
      this.overlay.destroy();
      this.overlay = null;
    }
  }

  public override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.stop();
    super.destroy(options);
  }
}
