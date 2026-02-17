import { Container } from 'pixi.js';

export abstract class BaseScene extends Container {
  protected isInitialized = false;
  protected isActive = false;

  constructor(name: string) {
    super();
    this.label = name;
  }

  public get initialized(): boolean {
    return this.isInitialized;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) {
      console.warn(`Scene ${this.label} already initialized`);
      return;
    }

    await this.onCreate();
    this.isInitialized = true;
  }

  public activate(): void {
    if (!this.isInitialized) {
      throw new Error(`Scene ${this.label} not initialized. Call init() first`);
    }

    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.visible = true;
    this.onActivate();
  }

  public deactivate(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.visible = false;
    this.onDeactivate();
  }

  public update(deltaTime: number): void {
    if (!this.isActive) {
      return;
    }

    this.onUpdate(deltaTime);
  }

  public override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.deactivate();
    this.onDestroy();
    super.destroy(options);
    this.isInitialized = false;
  }

  protected abstract onCreate(): Promise<void>;

  protected abstract onUpdate(deltaTime: number): void;

  protected onActivate(): void {
    // Override se necessário
  }

  protected onDeactivate(): void {
    // Override se necessário
  }

  protected onDestroy(): void {
    // Override se necessário
  }
}
