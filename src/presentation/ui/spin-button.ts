import { Container, Graphics, Text } from 'pixi.js';
import type { FederatedPointerEvent } from 'pixi.js';

export type SpinButtonState = 'idle' | 'disabled' | 'spinning';

export interface SpinButtonConfig {
  readonly width: number;
  readonly height: number;
}

export class SpinButton extends Container {
  private readonly buttonWidth: number;
  private readonly buttonHeight: number;

  private bg: Graphics;
  private labelText: Text;
  private spinner: Graphics;

  private currentState: SpinButtonState = 'idle';
  private onSpinCallback: (() => void) | null = null;

  private static readonly COLORS = {
    idle: { fill: 0xe74c3c, stroke: 0xc0392b },
    disabled: { fill: 0x7f8c8d, stroke: 0x95a5a6 },
    spinning: { fill: 0xf39c12, stroke: 0xe67e22 },
  } as const;

  constructor(config: SpinButtonConfig) {
    super();

    this.buttonWidth = config.width;
    this.buttonHeight = config.height;

    this.bg = new Graphics();
    this.addChild(this.bg);

    this.labelText = new Text({
      text: 'SPIN',
      style: {
        fontSize: 24,
        fill: 0xffffff,
        fontFamily: 'Grobold',
        fontWeight: 'bold',
      },
    });

    this.labelText.anchor.set(0.5);
    this.labelText.x = this.buttonWidth / 2;
    this.labelText.y = this.buttonHeight / 2;
    this.addChild(this.labelText);

    // Spinner central (substitui o texto quando spinning)
    this.spinner = new Graphics();
    this.spinner.x = this.buttonWidth / 2;
    this.spinner.y = this.buttonHeight / 2;
    this.spinner.visible = false;
    this.drawSpinner();
    this.addChild(this.spinner);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', this.handleClick, this);

    this.updateVisual();
  }

  private handleClick(_event: FederatedPointerEvent): void {
    if (this.currentState !== 'idle') return;
    this.onSpinCallback?.();
  }

  public onSpin(callback: () => void): void {
    this.onSpinCallback = callback;
  }

  public setState(state: SpinButtonState): void {
    if (this.currentState === state) return;
    this.currentState = state;
    this.updateVisual();
  }

  public getState(): SpinButtonState {
    return this.currentState;
  }

  private drawSpinner(): void {
    const r = 12;

    this.spinner.clear();

    // aro apagado
    this.spinner.circle(0, 0, r).stroke({
      width: 4,
      color: 0xffffff,
      alpha: 0.25,
    });

    // arco aceso (spinner real sem “linha estranha”)
    const start = -Math.PI / 2;
    const end = start + Math.PI * 0.8;

    this.spinner
      .moveTo(Math.cos(start) * r, Math.sin(start) * r)
      .arc(0, 0, r, start, end)
      .stroke({
        width: 4,
        color: 0xffffff,
        alpha: 1,
      });

    this.spinner.rotation = 0;
  }

  private updateVisual(): void {
    const colors = SpinButton.COLORS[this.currentState];

    this.bg.clear();
    this.bg.roundRect(0, 0, this.buttonWidth, this.buttonHeight, 10);
    this.bg.fill({ color: colors.fill });
    this.bg.stroke({ color: colors.stroke, width: 3 });

    const isSpinning = this.currentState === 'spinning';

    // texto some quando girando
    this.labelText.visible = !isSpinning;
    this.spinner.visible = isSpinning;

    this.cursor = this.currentState === 'idle' ? 'pointer' : 'not-allowed';
    this.alpha = this.currentState === 'disabled' ? 0.75 : 1;
  }

  public update(delta: number): void {
    if (this.currentState !== 'spinning') return;
    this.spinner.rotation += 5 * delta;
  }

  public override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.onSpinCallback = null;
    super.destroy(options);
  }
}
