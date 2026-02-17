import { Container, Graphics, Text } from 'pixi.js';

export interface BalanceDisplayConfig {
  readonly width: number;
  readonly height: number;
}

export class BalanceDisplay extends Container {
  private readonly displayWidth: number;
  private readonly displayHeight: number;
  private bg: Graphics | null = null;
  private labelText: Text | null = null;
  private valueText: Text | null = null;

  constructor(config: BalanceDisplayConfig) {
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
      text: 'BALANCE',
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
        fill: 0x2ecc71,
        fontFamily: 'Grobold',
        fontWeight: 'bold',
      },
    });
    this.valueText.anchor.set(0.5, 0);
    this.valueText.x = this.displayWidth / 2;
    this.valueText.y = 22;
    this.addChild(this.valueText);
  }

  public updateBalance(amount: number): void {
    if (!this.valueText) return;
    this.valueText.text = `$${amount.toFixed(2)}`;
  }

  public override destroy(options?: Parameters<Container['destroy']>[0]): void {
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
    super.destroy(options);
  }
}
