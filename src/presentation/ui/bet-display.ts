import { Container, Graphics, Text } from 'pixi.js';
import type { FederatedPointerEvent } from 'pixi.js';

export interface BetDisplayConfig {
  readonly width: number;
  readonly height: number;
}

export class BetDisplay extends Container {
  private readonly displayWidth: number;
  private readonly displayHeight: number;
  private bg: Graphics | null = null;
  private labelText: Text | null = null;
  private valueText: Text | null = null;
  private increaseBtn: Container | null = null;
  private decreaseBtn: Container | null = null;
  private onIncreaseCallback: (() => void) | null = null;
  private onDecreaseCallback: (() => void) | null = null;

  private static readonly BTN_SIZE = 36;
  private static readonly BTN_TOUCH_PAD = 8;

  constructor(config: BetDisplayConfig) {
    super();
    this.displayWidth = config.width;
    this.displayHeight = config.height;

    this.createDisplay();
  }

  private createDisplay(): void {
    this.bg = new Graphics();
    this.bg.roundRect(0, 0, this.displayWidth, this.displayHeight, 6);
    this.bg.fill({ color: 0x2c3e50, alpha: 0.8 });
    this.bg.stroke({ color: 0x34495e, width: 2 });
    this.addChild(this.bg);

    this.labelText = new Text({
      text: 'BET',
      style: {
        fontSize: 12,
        fill: 0x95a5a6,
        fontFamily: 'Grobold',
        fontWeight: 'bold',
      },
    });
    this.labelText.anchor.set(0.5, 0);
    this.labelText.x = this.displayWidth / 2;
    this.labelText.y = 6;
    this.addChild(this.labelText);

    this.valueText = new Text({
      text: '$0.00',
      style: {
        fontSize: 20,
        fill: 0xf1c40f,
        fontFamily: 'Grobold',
        fontWeight: 'bold',
      },
    });
    this.valueText.anchor.set(0.5, 0);
    this.valueText.x = this.displayWidth / 2;
    this.valueText.y = 22;
    this.addChild(this.valueText);

    const btnY = (this.displayHeight - BetDisplay.BTN_SIZE) / 2;

    this.decreaseBtn = this.createAdjustButton('-', -BetDisplay.BTN_SIZE - 6, btnY);
    this.decreaseBtn.on('pointerdown', (_e: FederatedPointerEvent) => {
      this.onDecreaseCallback?.();
    });
    this.addChild(this.decreaseBtn);

    this.increaseBtn = this.createAdjustButton('+', this.displayWidth + 6, btnY);
    this.increaseBtn.on('pointerdown', (_e: FederatedPointerEvent) => {
      this.onIncreaseCallback?.();
    });
    this.addChild(this.increaseBtn);
  }

  private createAdjustButton(label: string, xPos: number, yPos: number): Container {
    const btn = new Container();
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    // Expanded invisible hit area for easier touch
    const pad = BetDisplay.BTN_TOUCH_PAD;
    const hitArea = new Graphics();
    hitArea.rect(-pad, -pad, BetDisplay.BTN_SIZE + pad * 2, BetDisplay.BTN_SIZE + pad * 2);
    hitArea.fill({ color: 0xffffff, alpha: 0 });
    btn.addChild(hitArea);

    const bg = new Graphics();
    bg.roundRect(0, 0, BetDisplay.BTN_SIZE, BetDisplay.BTN_SIZE, 6);
    bg.fill({ color: 0x3498db });
    bg.stroke({ color: 0x2980b9, width: 2 });
    btn.addChild(bg);

    const text = new Text({
      text: label,
      style: {
        fontSize: 22,
        fill: 0xffffff,
        fontFamily: 'Grobold',
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.x = BetDisplay.BTN_SIZE / 2;
    text.y = BetDisplay.BTN_SIZE / 2;
    btn.addChild(text);

    btn.x = xPos;
    btn.y = yPos;

    return btn;
  }

  public onIncrease(callback: () => void): void {
    this.onIncreaseCallback = callback;
  }

  public onDecrease(callback: () => void): void {
    this.onDecreaseCallback = callback;
  }

  public updateBet(amount: number): void {
    if (!this.valueText) return;
    this.valueText.text = `$${amount.toFixed(2)}`;
  }

  public setEnabled(enabled: boolean): void {
    this.setIncreaseEnabled(enabled);
    this.setDecreaseEnabled(enabled);
  }

  public setIncreaseEnabled(enabled: boolean): void {
    if (this.increaseBtn) {
      this.increaseBtn.eventMode = enabled ? 'static' : 'none';
      this.increaseBtn.alpha = enabled ? 1 : 0.5;
    }
  }

  public setDecreaseEnabled(enabled: boolean): void {
    if (this.decreaseBtn) {
      this.decreaseBtn.eventMode = enabled ? 'static' : 'none';
      this.decreaseBtn.alpha = enabled ? 1 : 0.5;
    }
  }

  public override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.onIncreaseCallback = null;
    this.onDecreaseCallback = null;

    if (this.bg) {
      this.bg.destroy();
      this.bg = null;
    }
    if (this.labelText) {
      this.labelText.destroy();
      this.labelText = null;
    }
    if (this.valueText) {
      this.valueText.destroy();
      this.valueText = null;
    }
    if (this.increaseBtn) {
      this.increaseBtn.destroy({ children: true });
      this.increaseBtn = null;
    }
    if (this.decreaseBtn) {
      this.decreaseBtn.destroy({ children: true });
      this.decreaseBtn = null;
    }

    super.destroy(options);
  }
}
