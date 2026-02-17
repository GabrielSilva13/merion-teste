import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';

export interface WinDisplayConfig {
  readonly x: number;
  readonly y: number;
  readonly amount: number;
}

export class WinDisplay extends Container {
  private background: Graphics | null = null;
  private text: Text | null = null;
  private readonly amount: number;

  constructor(config: WinDisplayConfig) {
    super();
    this.amount = config.amount;
    this.x = config.x;
    this.y = config.y;

    this.createDisplay();
    this.animateEntrance();
  }

  private createDisplay(): void {
    this.background = new Graphics();
    this.background.roundRect(0, 0, 200, 80, 10);
    this.background.fill({ color: 0x2ecc71, alpha: 0.9 });
    this.background.stroke({ color: 0x27ae60, width: 4 });
    this.background.pivot.set(100, 40);
    this.addChild(this.background);

    this.text = new Text({
      text: `WIN!\n$${this.amount}`,
      style: {
        fontSize: 28,
        fill: 0xffffff,
        fontFamily: 'Grobold',
        fontWeight: 'bold',
        align: 'center',
        dropShadow: {
          color: 0x000000,
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
        },
      },
    });

    this.text.anchor.set(0.5);
    this.addChild(this.text);
  }

  private animateEntrance(): void {
    this.scale.set(0);
    this.alpha = 0;

    gsap.to(this, {
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 1,
      duration: 0.3,
      ease: 'back.out',
      onComplete: () => {
        gsap.to(this.scale, {
          x: 1,
          y: 1,
          duration: 0.15,
          ease: 'sine.out',
        });
      },
    });

    gsap.to(this, {
      y: this.y - 20,
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  public async animateExit(): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this, {
        alpha: 0,
        y: this.y - 40,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          this.destroy();
          resolve();
        },
      });
    });
  }

  public override destroy(options?: Parameters<Container['destroy']>[0]): void {
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.scale);

    if (this.background) {
      this.background.destroy();
      this.background = null;
    }

    if (this.text) {
      this.text.destroy();
      this.text = null;
    }

    super.destroy(options);
  }
}
