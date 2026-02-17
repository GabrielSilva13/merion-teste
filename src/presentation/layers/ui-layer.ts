import { Container } from 'pixi.js';
import { WinDisplay } from '../components/win-display';
import { BalanceDisplay } from '../ui/balance-display';
import { BetDisplay } from '../ui/bet-display';
import type { SpinButtonState } from '../ui/spin-button';
import { SpinButton } from '../ui/spin-button';
import { TotalWonDisplay } from '../ui/total-won-display';

export interface UILayerConfig {
  readonly screenWidth: number;
  readonly screenHeight: number;
}

export class UILayer extends Container {
  private readonly screenWidth: number;
  private readonly screenHeight: number;

  private spinButton: SpinButton | null = null;
  private balanceDisplay: BalanceDisplay | null = null;
  private betDisplay: BetDisplay | null = null;
  private totalWonDisplay: TotalWonDisplay | null = null;
  private winDisplay: WinDisplay | null = null;

  private onSpinCallback: (() => void) | null = null;
  private onIncreaseBetCallback: (() => void) | null = null;
  private onDecreaseBetCallback: (() => void) | null = null;

  private static readonly PANEL_HEIGHT_PERCENT = 0.08;
  private static readonly COMPONENT_GAP = 20;
  private static readonly BET_EXTRA_GAP = 35;
  private static readonly BALANCE_WIDTH = 140;
  private static readonly BET_WIDTH = 140;
  private static readonly SPIN_WIDTH = 120;
  private static readonly TOTAL_WON_WIDTH = 140;
  private static readonly COMPONENT_HEIGHT = 55;

  constructor(config: UILayerConfig) {
    super();
    this.screenWidth = config.screenWidth;
    this.screenHeight = config.screenHeight;

    this.createComponents();
    this.layoutComponents();
    this.connectCallbacks();
  }

  private createComponents(): void {
    this.balanceDisplay = new BalanceDisplay({
      width: UILayer.BALANCE_WIDTH,
      height: UILayer.COMPONENT_HEIGHT,
    });
    this.addChild(this.balanceDisplay);

    this.spinButton = new SpinButton({
      width: UILayer.SPIN_WIDTH,
      height: UILayer.COMPONENT_HEIGHT,
    });
    this.addChild(this.spinButton);

    this.betDisplay = new BetDisplay({
      width: UILayer.BET_WIDTH,
      height: UILayer.COMPONENT_HEIGHT,
    });
    this.addChild(this.betDisplay);

    this.totalWonDisplay = new TotalWonDisplay({
      width: UILayer.TOTAL_WON_WIDTH,
      height: UILayer.COMPONENT_HEIGHT,
    });
    this.addChild(this.totalWonDisplay);
  }

  private layoutComponents(): void {
    const totalWidth =
      UILayer.BALANCE_WIDTH +
      UILayer.TOTAL_WON_WIDTH +
      UILayer.SPIN_WIDTH +
      UILayer.BET_WIDTH +
      UILayer.COMPONENT_GAP * 2 +
      (UILayer.COMPONENT_GAP + UILayer.BET_EXTRA_GAP);

    const startX = (this.screenWidth - totalWidth) / 2;
    const panelY =
      this.screenHeight -
      this.screenHeight * UILayer.PANEL_HEIGHT_PERCENT -
      UILayer.COMPONENT_HEIGHT / 2;

    let offsetX = startX;

    if (this.balanceDisplay) {
      this.balanceDisplay.x = offsetX;
      this.balanceDisplay.y = panelY;
      offsetX += UILayer.BALANCE_WIDTH + UILayer.COMPONENT_GAP;
    }

    if (this.totalWonDisplay) {
      this.totalWonDisplay.x = offsetX;
      this.totalWonDisplay.y = panelY;
      offsetX += UILayer.TOTAL_WON_WIDTH + UILayer.COMPONENT_GAP;
    }

    if (this.spinButton) {
      this.spinButton.x = offsetX;
      this.spinButton.y = panelY;
      offsetX += UILayer.SPIN_WIDTH + UILayer.COMPONENT_GAP;
    }

    if (this.betDisplay) {
      offsetX += UILayer.BET_EXTRA_GAP;
      this.betDisplay.x = offsetX;
      this.betDisplay.y = panelY;
    }
  }

  private connectCallbacks(): void {
    this.spinButton?.onSpin(() => {
      this.onSpinCallback?.();
    });

    this.betDisplay?.onIncrease(() => {
      this.onIncreaseBetCallback?.();
    });

    this.betDisplay?.onDecrease(() => {
      this.onDecreaseBetCallback?.();
    });
  }

  // ✅ chama no update da Scene pra animar o spinner
  public update(deltaTime: number): void {
    this.spinButton?.update(deltaTime);
  }

  public onSpin(callback: () => void): void {
    this.onSpinCallback = callback;
  }

  public onIncreaseBet(callback: () => void): void {
    this.onIncreaseBetCallback = callback;
  }

  public onDecreaseBet(callback: () => void): void {
    this.onDecreaseBetCallback = callback;
  }

  public setBalance(value: number): void {
    this.balanceDisplay?.updateBalance(value);
  }

  public setBet(value: number): void {
    this.betDisplay?.updateBet(value);
  }

  public addWin(amount: number): void {
    this.totalWonDisplay?.addWin(amount);
  }

  public setSpinState(state: SpinButtonState): void {
    this.spinButton?.setState(state);
    if (state !== 'idle') {
      this.betDisplay?.setEnabled(false);
    }
  }

  public setBetButtons(canIncrease: boolean, canDecrease: boolean): void {
    this.betDisplay?.setIncreaseEnabled(canIncrease);
    this.betDisplay?.setDecreaseEnabled(canDecrease);
  }

  public showWin(amount: number): void {
    this.clearWin();

    this.winDisplay = new WinDisplay({
      x: this.screenWidth / 2,
      y: this.screenHeight / 2,
      amount,
    });

    this.addChild(this.winDisplay);
  }

  public clearWin(): void {
    if (this.winDisplay) {
      this.winDisplay.destroy();
      this.winDisplay = null;
    }
  }

  public override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.onSpinCallback = null;
    this.onIncreaseBetCallback = null;
    this.onDecreaseBetCallback = null;

    this.clearWin();

    if (this.spinButton) {
      this.spinButton.destroy();
      this.spinButton = null;
    }
    if (this.balanceDisplay) {
      this.balanceDisplay.destroy();
      this.balanceDisplay = null;
    }
    if (this.betDisplay) {
      this.betDisplay.destroy();
      this.betDisplay = null;
    }
    if (this.totalWonDisplay) {
      this.totalWonDisplay.destroy();
      this.totalWonDisplay = null;
    }

    super.destroy(options);
  }
}
