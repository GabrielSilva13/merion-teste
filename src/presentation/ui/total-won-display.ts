import { Container, Graphics, Text } from 'pixi.js';

export interface TotalWonDisplayConfig {
  readonly width: number;
  readonly height: number;
}

export class TotalWonDisplay extends Container {
  private readonly displayWidth: number;
  private readonly displayHeight: number;
  private bg: Graphics | null = null;
  private labelText: Text | null = null;
  private valueText: Text | null = null;
  private totalWon = 0;

  constructor(config: TotalWonDisplayConfig) {
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
      text: 'WON',
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
        fill: 0x95a5a6,
        fontFamily: 'Grobold',
        fontWeight: 'bold',
      },
    });
    this.valueText.anchor.set(0.5, 0);
    this.valueText.x = this.displayWidth / 2;
    this.valueText.y = 22;
    this.addChild(this.valueText);
  }

  public addWin(amount: number): void {
    this.totalWon += amount;
    this.updateDisplay();
  }

  public getTotalWon(): number {
    return this.totalWon;
  }

  private updateDisplay(): void {
    if (!this.valueText) return;

    this.valueText.text = `$${this.totalWon.toFixed(2)}`;

    if (this.totalWon > 0) {
      this.valueText.style.fill = 0xf1c40f; // gold slot vibe
    } else {
      this.valueText.style.fill = 0x95a5a6; // cinza neutro
    }
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
