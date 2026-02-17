import type { Container } from 'pixi.js';
import type { BaseScene } from './scenes/base-scene';

export class SceneManager {
  private readonly scenes: Map<string, BaseScene>;
  private currentScene: BaseScene | null = null;
  private readonly root: Container;

  constructor(root: Container) {
    this.scenes = new Map();
    this.root = root;
  }

  public registerScene(name: string, scene: BaseScene): void {
    if (this.scenes.has(name)) {
      throw new Error(`Scene ${name} already registered`);
    }

    this.scenes.set(name, scene);
  }

  public unregisterScene(name: string): void {
    const scene = this.scenes.get(name);
    if (!scene) {
      console.warn(`Scene ${name} not found`);
      return;
    }

    if (this.currentScene === scene) {
      throw new Error(`Cannot unregister active scene ${name}`);
    }

    scene.destroy();
    this.scenes.delete(name);
  }

  public async switchTo(name: string): Promise<void> {
    const scene = this.scenes.get(name);
    if (!scene) {
      throw new Error(`Scene ${name} not found`);
    }

    if (this.currentScene === scene) {
      console.warn(`Scene ${name} already active`);
      return;
    }

    if (this.currentScene) {
      this.currentScene.deactivate();
      this.root.removeChild(this.currentScene);
    }

    if (!scene.initialized) {
      await scene.init();
    }

    this.root.addChild(scene);
    scene.activate();
    this.currentScene = scene;
  }

  public getCurrentScene(): BaseScene | null {
    return this.currentScene;
  }

  public getScene(name: string): BaseScene | null {
    return this.scenes.get(name) ?? null;
  }

  public hasScene(name: string): boolean {
    return this.scenes.has(name);
  }

  public update(deltaTime: number): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  public destroy(): void {
    if (this.currentScene) {
      this.currentScene.deactivate();
      this.currentScene = null;
    }

    for (const scene of this.scenes.values()) {
      scene.destroy();
    }

    this.scenes.clear();
  }
}
