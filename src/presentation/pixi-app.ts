import { Application, Container } from 'pixi.js';
import type { ApplicationOptions } from 'pixi.js';

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

export interface PixiAppConfig extends Partial<ApplicationOptions> {
  readonly containerId: string;
}

export class PixiApp {
  private app: Application | null = null;
  private stageRoot: Container | null = null;
  private updateCallback: ((delta: number) => void) | null = null;
  private readonly config: PixiAppConfig;
  private isRunning = false;
  private resizeHandler?: () => void;
  private resizeTimer?: ReturnType<typeof setTimeout>;

  constructor(config: PixiAppConfig) {
    this.config = config;
  }

  public async initialize(): Promise<void> {
    if (this.app) {
      console.warn('PixiApp already initialized');
      return;
    }

    this.app = new Application();

    const container = document.getElementById(this.config.containerId);
    if (!container) {
      throw new Error(`Container #${this.config.containerId} not found`);
    }

    await this.app.init({
      background: this.config.background ?? 0x1a1a2e,
      resolution: this.config.resolution ?? window.devicePixelRatio,
      autoDensity: this.config.autoDensity ?? true,
      antialias: this.config.antialias ?? true,
      resizeTo: container,
      ...this.config,
    });

    container.appendChild(this.app.canvas);
    this.setupStage();
    this.setupResize();
    this.lockLandscape();
  }

  private setupStage(): void {
    if (!this.app) {
      throw new Error('App not initialized');
    }

    this.stageRoot = new Container();
    this.stageRoot.label = 'StageRoot';
    this.app.stage.addChild(this.stageRoot);
  }

  private lockLandscape(): void {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (type: string) => Promise<void>;
    };
    orientation.lock?.('landscape')?.catch(() => {
      // Not supported or not in fullscreen — CSS fallback handles it
    });
  }

  private setupResize(): void {
    this.resizeHandler = () => {
      // Immediate update
      this.handleResize();
      // Delayed update — catches orientation changes where dimensions
      // aren't final when the first resize event fires
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.handleResize(), 150);
    };
    window.addEventListener('resize', this.resizeHandler);
    this.handleResize();
  }

  private handleResize(): void {
    if (!this.app || !this.stageRoot) return;

    const w = this.app.screen.width;
    const h = this.app.screen.height;

    const scale = Math.max(w / DESIGN_WIDTH, h / DESIGN_HEIGHT);

    this.stageRoot.scale.set(scale);

    // Horizontal: centered (left/right crop is symmetric — safe)
    this.stageRoot.x = (w - DESIGN_WIDTH * scale) / 2;

 
    this.stageRoot.y = h - DESIGN_HEIGHT * scale;
  }

  public start(): void {
    if (!this.app) {
      throw new Error('App not initialized. Call initialize() first');
    }

    if (this.isRunning) {
      console.warn('PixiApp already running');
      return;
    }

    this.isRunning = true;
    this.app.ticker.add(this.tick, this);
  }

  public stop(): void {
    if (!this.app || !this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.app.ticker.remove(this.tick, this);
  }

  private tick(ticker: any): void {
    if (!this.isRunning) return;
    const deltaSeconds = ticker.deltaMS / 1000;
    this.updateCallback?.(deltaSeconds);
  }

  public getApp(): Application {
    if (!this.app) {
      throw new Error('App not initialized');
    }
    return this.app;
  }

  public getStageRoot(): Container {
    if (!this.stageRoot) {
      throw new Error('Stage root not initialized');
    }
    return this.stageRoot;
  }

  public getScreenWidth(): number {
    return DESIGN_WIDTH;
  }

  public getScreenHeight(): number {
    return DESIGN_HEIGHT;
  }

  public setUpdateHandler(handler: (delta: number) => void): void {
    this.updateCallback = handler;
  }

  public destroy(): void {
    this.stop();
    clearTimeout(this.resizeTimer);

    if (this.stageRoot) {
      this.stageRoot.destroy({ children: true });
      this.stageRoot = null;
    }

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}
