import { Graphics, Text } from 'pixi.js';
import { BaseScene } from './base-scene';
import { COLORS } from '@core/constants';

export class DemoScene extends BaseScene {
  private background: Graphics | null = null;
  private centerBox: Graphics | null = null;
  private titleText: Text | null = null;
  private stateText: Text | null = null;
  private elapsedTime = 0;

  constructor() {
    super('DemoScene');
  }

  protected async onCreate(): Promise<void> {
    this.createBackground();
    this.createCenterBox();
    this.createTexts();
  }

  private createBackground(): void {
    this.background = new Graphics();
    this.background.rect(0, 0, window.innerWidth, window.innerHeight);
    this.background.fill({ color: COLORS.BACKGROUND });
    this.addChild(this.background);
  }

  private createCenterBox(): void {
    const boxWidth = 600;
    const boxHeight = 400;
    const x = (window.innerWidth - boxWidth) / 2;
    const y = (window.innerHeight - boxHeight) / 2;

    this.centerBox = new Graphics();
    this.centerBox.rect(0, 0, boxWidth, boxHeight);
    this.centerBox.fill({ color: COLORS.SECONDARY });
    this.centerBox.stroke({ color: COLORS.PRIMARY, width: 4 });
    this.centerBox.position.set(x, y);
    this.addChild(this.centerBox);
  }

  private createTexts(): void {
    this.titleText = new Text({
      text: 'Slot Machine Engine',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: COLORS.WHITE,
        align: 'center',
      },
    });

    this.titleText.anchor.set(0.5);
    this.titleText.position.set(window.innerWidth / 2, window.innerHeight / 2 - 50);
    this.addChild(this.titleText);

    this.stateText = new Text({
      text: 'State: IDLE\nEngine Ready',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: COLORS.ACCENT,
        align: 'center',
      },
    });

    this.stateText.anchor.set(0.5);
    this.stateText.position.set(window.innerWidth / 2, window.innerHeight / 2 + 50);
    this.addChild(this.stateText);
  }

  protected onUpdate(deltaTime: number): void {
    this.elapsedTime += deltaTime;

    if (this.stateText) {
      const pulse = Math.sin(this.elapsedTime * 2) * 0.5 + 0.5;
      this.stateText.alpha = 0.6 + pulse * 0.4;
    }
  }

  protected override onDestroy(): void {
    this.background?.destroy();
    this.centerBox?.destroy();
    this.titleText?.destroy();
    this.stateText?.destroy();

    this.background = null;
    this.centerBox = null;
    this.titleText = null;
    this.stateText = null;
  }
}
