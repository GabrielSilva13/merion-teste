import { GameController } from '@application/game-controller';
import { APP_CONFIG } from '@config/app.config';
import { DefaultRNG } from '@domain/rng';
import { createSlotMachine } from '@domain/slot-machine-factory';
import { FakeSlotApi } from '@infrastructure/fake-slot-api';
import { PixiApp } from '@presentation/pixi-app';
import { SceneManager } from '@presentation/scene-manager';
import { SlotScene } from '@presentation/scenes/slot-scene';

import { loadGameAssets } from './infrastructure/asset-loader';
import '@presentation/debug/perf-overlay';


declare global {
  interface Window {
    app?: SlotMachineApp;
  }
}

class SlotMachineApp extends PixiApp {
  private sceneManager: SceneManager | null = null;
  private controller: GameController | null = null;

  constructor() {
    super({
      containerId: 'app',
      background: APP_CONFIG.pixi.backgroundColor,
      resolution: APP_CONFIG.pixi.resolution,
      autoDensity: APP_CONFIG.pixi.autoDensity,
      antialias: APP_CONFIG.pixi.antialias,
      powerPreference: APP_CONFIG.pixi.powerPreference,
    });
  }

  public override async initialize(): Promise<void> {
    await super.initialize();

    await loadGameAssets();


    this.setUpdateHandler((dt) => this.onUpdate(dt));
    this.initializeController();
    await this.initializeScenes();
  }

  private initializeController(): void {
    const slotMachine = createSlotMachine();
    const api = new FakeSlotApi({
      slotMachine,
      rng: new DefaultRNG(),
    });

    this.controller = new GameController({
      api,
      initialBalance: 1000,
      initialBet: 10,
    });

    this.controller.getState().subscribe({
      onStateChange: (state) => {
        console.log('State changed:', state);
      },
      onBalanceChange: (balance) => {
        console.log('Balance updated:', balance);
      },
      onBetChange: (bet) => {
        console.log('Bet updated:', bet);
      },
    });
  }

  private async initializeScenes(): Promise<void> {
    if (!this.controller) {
      throw new Error('Controller not initialized');
    }




    this.sceneManager = new SceneManager(this.getStageRoot());

    const slotScene = new SlotScene({
      controller: this.controller,
      screenWidth: this.getScreenWidth(),
      screenHeight: this.getScreenHeight(),
    });

    this.sceneManager.registerScene('slot', slotScene);
    this.sceneManager.switchTo('slot');
  }

  protected onUpdate(deltaTime: number): void {
    this.sceneManager?.update(deltaTime);
  }

  public getController(): GameController {
    if (!this.controller) {
      throw new Error('Controller not initialized');
    }
    return this.controller;
  }

  public getSceneManager(): SceneManager {
    if (!this.sceneManager) {
      throw new Error('SceneManager not initialized');
    }
    return this.sceneManager;
  }

  public override destroy(): void {
    this.sceneManager?.destroy();
    this.sceneManager = null;
    this.controller = null;
    super.destroy();
  }
}

async function bootstrap(): Promise<void> {
  try {
    const app = new SlotMachineApp();
    await app.initialize();
    app.start();

    // Fade out and remove preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      preloader.addEventListener('transitionend', () => preloader.remove());
    }

    setInterval(() => {
      const pixiApp = window.app?.getApp?.();
      if (!pixiApp) return;

      console.log('FPS real:', pixiApp.ticker.FPS);
    }, 1000);

    window.app = app;
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    throw error;
  }
}

bootstrap();
