import { Container } from 'pixi.js';

/**
 * Base View class - Presentation layer
 * Classe base para todos os componentes visuais
 */

export abstract class BaseView extends Container {
  protected isInitialized = false;

  constructor() {
    super();
  }

  /**
   * Inicializa o componente visual
   */
  public async init(): Promise<void> {
    if (this.isInitialized) {
      console.warn(`${this.constructor.name} already initialized`);
      return;
    }

    await this.onCreate();
    this.isInitialized = true;
  }

  /**
   * Template method para subclasses implementarem
   */
  protected abstract onCreate(): Promise<void>;

  /**
   * Destrói o componente e libera recursos
   */
  public override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.onDestroy();
    super.destroy(options);
    this.isInitialized = false;
  }

  /**
   * Hook para limpeza de recursos
   */
  protected onDestroy(): void {
    // Override se necessário
  }
}
