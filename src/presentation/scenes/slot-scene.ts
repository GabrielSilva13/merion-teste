import type { GameController } from '@application/game-controller';
import type { GameStateObserver } from '@application/game-state';
import type { SymbolId } from '@domain/types';
import { Sprite } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';
import { ReelView } from '../components/reel-view';
import { WinCelebration } from '../components/win-celebration';
import { UILayer } from '../layers/ui-layer';
import { FoxCharacter } from '../spine/fox-character';
import { SpineSymbolPool } from '../symbols/spine-symbol-pool';
import { BaseScene } from './base-scene';

export interface SlotSceneConfig {
  readonly controller: GameController;
  readonly screenWidth: number;
  readonly screenHeight: number;
}

export class SlotScene extends BaseScene {
  private readonly controller: GameController;
  private readonly screenWidth: number;
  private readonly screenHeight: number;
  private readonly reels: ReelView[] = [];
  private isSpinning = false;
  private symbolSize = 0;
  private gridStartX = 0;
  private gridStartY = 0;
  private uiLayer: UILayer | null = null;
  private readonly stateObserver: GameStateObserver;
  private fox: FoxCharacter | null = null;
  private winCelebration: WinCelebration | null = null;
  private reelsContainer: Container | null = null;
  private reelsMask: Graphics | null = null;
  private reelsFrame: Graphics | null = null;

  private static readonly STRIP_LENGTH = 50;
  private static readonly VISIBLE_ROWS = 4;
  private static readonly REEL_COUNT = 5;
  private static readonly REEL_AREA_HEIGHT_DESKTOP = 0.65;
  private static readonly REEL_AREA_HEIGHT_MOBILE = 0.5;
  private static readonly BASE_SPIN_DURATION = 2;
  private static readonly CASCADE_DELAY = 0.25;
  private static readonly BET_STEP = 10;
  private static readonly MIN_BET = 10;

  private static reelAreaHeightPercent(): number {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return isMobile
      ? SlotScene.REEL_AREA_HEIGHT_MOBILE
      : SlotScene.REEL_AREA_HEIGHT_DESKTOP;
  }

  constructor(config: SlotSceneConfig) {
    super('SlotScene');
    this.controller = config.controller;
    this.screenWidth = config.screenWidth;
    this.screenHeight = config.screenHeight;

    this.stateObserver = {
      onBalanceChange: (balance: number) => this.uiLayer?.setBalance(balance),
      onBetChange: (bet: number) => this.uiLayer?.setBet(bet),
      onStateChange: () => this.syncUI(),
    };
  }

  protected async onCreate(): Promise<void> {
    this.createBackground();

    // Pre-create symbol instances so first spin has zero allocations
    const reelAreaHeight = this.screenHeight * SlotScene.reelAreaHeightPercent();
    const warmSymbolSize = Math.floor(reelAreaHeight / SlotScene.VISIBLE_ROWS);
    SpineSymbolPool.warmUp(warmSymbolSize);

    this.createReels();
    this.createUILayer();

    this.fox = new FoxCharacter();
    this.fox.x = this.screenWidth - 150;
    this.fox.y = this.screenHeight - 200;
    this.fox.scale.set(-0.14, 0.14);
    this.addChild(this.fox);

    this.winCelebration = new WinCelebration();
    this.addChild(this.winCelebration);

    this.controller.getState().subscribe(this.stateObserver);
    this.syncUI();
  }

  private createBackground(): void {
    const bg = Sprite.from('bgMain');

    bg.anchor.set(0.5);

    const scaleX = this.screenWidth / bg.texture.width;
    const scaleY = this.screenHeight / bg.texture.height;
    const scale = Math.max(scaleX, scaleY);

    bg.scale.set(scale);
    bg.x = this.screenWidth * 0.5;
    bg.y = this.screenHeight * 0.5;

    this.addChildAt(bg, 0);
  }

  private createReels(): void {
    const reelAreaHeight = this.screenHeight * SlotScene.reelAreaHeightPercent();
    this.symbolSize = Math.floor(reelAreaHeight / SlotScene.VISIBLE_ROWS);

    const gridWidth = this.symbolSize * SlotScene.REEL_COUNT;
    const gridHeight = this.symbolSize * SlotScene.VISIBLE_ROWS;

    this.gridStartX = (this.screenWidth - gridWidth) / 2;

    // Position reels from the bottom up (above UI panel) so the browser
    // navigation bar on mobile doesn't cover the first row.
    const uiPanelTop = this.screenHeight * 0.92 - 30;
    this.gridStartY = uiPanelTop - gridHeight - 30;

    // Container pai (tudo que é reel fica aqui dentro)
    this.reelsContainer = new Container();
    this.reelsContainer.x = this.gridStartX;
    this.reelsContainer.y = this.gridStartY;
    this.addChild(this.reelsContainer);

    // Máscara única do conjunto
    const pad = Math.floor(this.symbolSize * 0.25);
    this.reelsMask = new Graphics()
      .rect(-pad / 2, -pad / 2, gridWidth + pad, gridHeight + pad)
      .fill({ color: 0xffffff });

    // A máscara precisa estar na cena (ou dentro do mesmo container)
    this.reelsContainer.addChild(this.reelsMask);
    this.reelsContainer.mask = this.reelsMask;

    const darkBg = this.createReelsBackground(gridWidth, gridHeight);
    this.reelsContainer.addChild(darkBg);
    const lasers = this.createLaserDividers(gridHeight);
    this.reelsContainer.addChild(lasers);

    // Cria reels (agora posição é relativa ao reelsContainer)
    for (let i = 0; i < SlotScene.REEL_COUNT; i++) {
      const symbols = this.generateStripSymbols();

      const reel = new ReelView({
        symbols,
        symbolSize: this.symbolSize,
        visibleRows: SlotScene.VISIBLE_ROWS,
      });

      reel.x = i * this.symbolSize;
      reel.y = 0;
      this.reelsContainer.addChild(reel);
      this.reels.push(reel);
    }

    // Moldura por cima (fora do container mascarado)

    this.reelsFrame = this.createReelsFrame(gridWidth, gridHeight, pad);
    this.reelsFrame.x = this.gridStartX;
    this.reelsFrame.y = this.gridStartY;
    this.addChild(this.reelsFrame);
  }

  private createUILayer(): void {
    this.uiLayer = new UILayer({
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
    });

    this.uiLayer.onSpin(() => this.handleSpin());
    this.uiLayer.onIncreaseBet(() => this.handleIncreaseBet());
    this.uiLayer.onDecreaseBet(() => this.handleDecreaseBet());

    this.addChild(this.uiLayer);
  }

  private generateStripSymbols(): SymbolId[] {
    const weights: Record<SymbolId, number> = {
      ORANGE: 10,
      GRAPE: 14,
      BELL: 14,
      BAR: 14,
      SEVEN: 14,
      DIAMOND: 8,
      WILD: 2,
      HANDCUFFS: 6,
      BANK: 6,
    };

    const bag: SymbolId[] = [];
    for (const [sym, w] of Object.entries(weights) as [SymbolId, number][]) {
      for (let i = 0; i < w; i++) bag.push(sym);
    }

    const strip: SymbolId[] = [];
    for (let i = 0; i < SlotScene.STRIP_LENGTH; i++) {
      const randomIndex = (Math.random() * bag.length) | 0;
      const symbol = bag[randomIndex];
      if (symbol) {
        strip.push(symbol);
      }
    }

    return strip;
  }

  private syncUI(): void {
    if (!this.uiLayer) return;

    const balance = this.controller.getBalance();
    const bet = this.controller.getBet();
    const isIdle = this.controller.getStatus() === 'idle';

    this.uiLayer.setBalance(balance);
    this.uiLayer.setBet(bet);

    if (this.isSpinning) {
      this.uiLayer.setSpinState('spinning');
    } else if (!isIdle) {
      this.uiLayer.setSpinState('spinning');
    } else if (this.controller.canSpin()) {
      this.uiLayer.setSpinState('idle');
    } else {
      this.uiLayer.setSpinState('disabled');
    }

    const canIncrease = isIdle && !this.isSpinning && bet + SlotScene.MIN_BET <= balance;
    const canDecrease = isIdle && !this.isSpinning && bet - SlotScene.BET_STEP >= SlotScene.MIN_BET;
    this.uiLayer.setBetButtons(canIncrease, canDecrease);
  }

  private handleIncreaseBet(): void {
    try {
      this.controller.setBet(this.controller.getBet() + SlotScene.BET_STEP);
    } catch {
      // Bet rejected by controller
    }
    this.syncUI();
  }

  private handleDecreaseBet(): void {
    try {
      this.controller.setBet(this.controller.getBet() - SlotScene.BET_STEP);
    } catch {
      // Bet rejected by controller
    }
    this.syncUI();
  }

  private createLaserDividers(gridHeight: number): Graphics {
    const g = new Graphics();

    g.blendMode = 'add';

    for (let i = 1; i < SlotScene.REEL_COUNT; i++) {
      const x = i * this.symbolSize;

      // glow bem largo (suave)
      g.rect(x - 10, 0, 20, gridHeight).fill({ color: 0xff0000, alpha: 0.05 });

      // glow largo
      g.rect(x - 6, 0, 12, gridHeight).fill({ color: 0xff0000, alpha: 0.1 });

      // glow médio
      g.rect(x - 3, 0, 6, gridHeight).fill({ color: 0xff0000, alpha: 0.22 });

      // núcleo
      g.rect(x - 1, 0, 2, gridHeight).fill({ color: 0xff3b3b, alpha: 1 });
    }

    g.eventMode = 'none';
    return g;
  }

  private async handleSpin(): Promise<void> {
    if (this.isSpinning) return;

    if (!this.controller.canSpin()) {
      console.warn('Cannot spin');
      return;
    }

    this.isSpinning = true;
    this.syncUI();

    try {
      const result = await this.controller.spin();

      if (!result) {
        console.warn('Spin returned null');
        return;
      }

      const spinPromises: Promise<void>[] = [];

      for (let i = 0; i < result.reels.length; i++) {
        const reelInfo = result.reels[i];
        const reelView = this.reels[i];

        if (!reelInfo || !reelView) continue;

        const duration = SlotScene.BASE_SPIN_DURATION + i * SlotScene.CASCADE_DELAY;
        spinPromises.push(reelView.spinTo(reelInfo.startIndex, duration));
      }

      await Promise.all(spinPromises);

      if (result.totalWin > 0) {
        this.uiLayer?.addWin(result.totalWin);
        await this.showWins(result);
        this.controller.finishWinPresentation();
      }
    } catch (error) {
      console.error('Spin error:', error);
    } finally {
      this.isSpinning = false;
      this.syncUI();
    }
  }

  private async showWins(result: import('@domain/types').SpinResult): Promise<void> {
    const bet = this.controller.getBet();
    const multiplier = result.totalWin / bet;

    let tier: 'total' | 'mega' | 'superMega';
    if (multiplier >= 50) {
      tier = 'superMega';
    } else if (multiplier >= 20) {
      tier = 'mega';
    } else {
      tier = 'total';
    }

    await this.winCelebration?.play(tier, this.screenWidth, this.screenHeight);
  }

  protected onUpdate(deltaTime: number): void {
    for (const reel of this.reels) {
      reel.update(deltaTime);
    }

    this.uiLayer?.update(deltaTime);
  }

  private createReelsFrame(gridWidth: number, gridHeight: number, pad: number): Graphics {
    const g = new Graphics();

    const x = -pad / 2;
    const y = -pad / 2;
    const w = gridWidth + pad;
    const h = gridHeight + pad;

    const t = Math.max(10, Math.floor(this.symbolSize * 0.14)); // espessura
    const r = Math.max(14, Math.floor(this.symbolSize * 0.22)); // raio dos cantos

    // Base “metal”
    g.roundRect(x, y, w, h, r).stroke({ color: 0x6f7a86, alpha: 1 });

    // Brilho externo
    g.roundRect(x, y, w, h, r).stroke({ width: 3, color: 0xe7edf5, alpha: 0.9 });
    // Sombra externa
    g.roundRect(x, y, w, h, r).stroke({ width: 3, color: 0x1a1f26, alpha: 0.7 });

    // Linha interna pra dar “profundidade”
    g.roundRect(x + t, y + t, w - 2 * t, h - 2 * t, Math.max(8, r - t)).stroke({
      width: 2,
      color: 0x000000,
      alpha: 0.35,
    });

    // Divisórias verticais entre reels (tipo a imagem)
    for (let i = 1; i < SlotScene.REEL_COUNT; i++) {
      const lx = i * this.symbolSize;

      // “Canal” escuro
      g.rect(lx - 2, y + t * 0.6, 4, h - t * 1.2).fill({ color: 0x000000, alpha: 0.22 });
      // “Filete” claro
      g.rect(lx - 1, y + t * 0.6, 2, h - t * 1.2).fill({ color: 0xffffff, alpha: 0.12 });
    }

    // Parafusos (cantos + topo das divisórias)
    const boltR = Math.max(5, Math.floor(this.symbolSize * 0.07));

    const bolt = (cx: number, cy: number) => {
      g.circle(cx, cy, boltR).fill({ color: 0xd2d8e0, alpha: 1 });
      g.circle(cx, cy, boltR).stroke({ width: 2, color: 0x2a2f37, alpha: 0.6 });
      g.rect(cx - boltR * 0.6, cy - 1, boltR * 1.2, 2).fill({ color: 0x2a2f37, alpha: 0.6 });
    };

    // 4 cantos
    bolt(x + t * 0.7, y + t * 0.7);
    bolt(x + w - t * 0.7, y + t * 0.7);
    bolt(x + t * 0.7, y + h - t * 0.7);
    bolt(x + w - t * 0.7, y + h - t * 0.7);

    // topo das divisórias
    for (let i = 1; i < SlotScene.REEL_COUNT; i++) {
      const cx = i * this.symbolSize;
      bolt(cx, y + t * 0.7);
      bolt(cx, y + h - t * 0.7);
    }

    g.eventMode = 'none';
    return g;
  }

  private createReelsBackground(gridWidth: number, gridHeight: number): Graphics {
    const g = new Graphics();

    const r = Math.max(14, Math.floor(this.symbolSize * 0.1));

    g.roundRect(0, 0, gridWidth, gridHeight, r).fill({ color: 0x0b1118, alpha: 0.82 });

    g.roundRect(0, 0, gridWidth, gridHeight, r).stroke({ width: 40, color: 0x000000, alpha: 0.12 });

    g.roundRect(0, 0, gridWidth, gridHeight, r).stroke({ width: 2, color: 0x1a222c, alpha: 0.4 });

    g.eventMode = 'none';
    return g;
  }

  protected override onDestroy(): void {
    this.controller.getState().unsubscribe(this.stateObserver);

    for (const reel of this.reels) {
      reel.destroy();
    }
    this.reels.length = 0;

    if (this.winCelebration) {
      this.winCelebration.destroy();
      this.winCelebration = null;
    }

    if (this.uiLayer) {
      this.uiLayer.destroy();
      this.uiLayer = null;
    }
  }
}
