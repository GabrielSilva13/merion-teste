import type { SymbolId } from '@domain/types';
import gsap from 'gsap';
import { Container, Graphics } from 'pixi.js';
import type { SpineSymbol } from '../symbols/spine-symbol';
import { SpineSymbolPool } from '../symbols/spine-symbol-pool';

export interface ReelViewConfig {
  readonly symbols: readonly SymbolId[];
  readonly symbolSize: number;
  readonly visibleRows: number;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Shared counter: how many Spine.update() calls happened this frame across all reels. */
let _spinesUpdatedThisFrame = 0;
let _frameId = 0;
let _lastFrameId = -1;

export function getSpinesUpdatedThisFrame(): number {
  return _spinesUpdatedThisFrame;
}

export class ReelView extends Container {
  private readonly symbolSize: number;
  private readonly visibleRows: number;
  private readonly stripSymbols: readonly SymbolId[];
  private readonly stripLength: number;

  private readonly stripContainer: Container;
  private readonly reelMask: Graphics;

  private readonly poolSize: number;
  private pool: { id: SymbolId; view: SpineSymbol }[] = [];

  private lastBaseRow = 0;

  private currentOffset = 0;
  private isSpinning = false;

  /** Viewport top/bottom in strip-container local space (recomputed each frame). */
  private vpTop = 0;
  private vpBottom = 0;

  constructor(config: ReelViewConfig) {
    super();

    this.symbolSize = config.symbolSize;
    this.visibleRows = config.visibleRows;

    this.stripSymbols = config.symbols;
    this.stripLength = config.symbols.length;

    this.poolSize = this.visibleRows + 3;

    this.stripContainer = new Container();
    this.stripContainer.sortableChildren = true;
    this.addChild(this.stripContainer);

    this.createPool();

    this.reelMask = this.createMask();
    this.stripContainer.mask = this.reelMask;

    this.updatePosition();
  }

  private createPool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const id = this.stripSymbols[i % this.stripLength]!;
      const view = SpineSymbolPool.acquire(id, this.symbolSize);

      view.x = this.symbolSize / 2;
      view.y = i * this.symbolSize + this.symbolSize / 2;
      (view as unknown as { zIndex: number }).zIndex = i;

      this.stripContainer.addChild(view);
      this.pool.push({ id, view });
    }
  }

  private createMask(): Graphics {
    const pad = this.symbolSize * 0.25;
    const mask = new Graphics();
    mask
      .rect(-pad / 2, -pad / 2, this.symbolSize + pad, this.visibleRows * this.symbolSize + pad)
      .fill({ color: 0xffffff });

    this.addChild(mask);
    return mask;
  }

  private replacePoolSlot(slotIndex: number, newId: SymbolId): void {
    const old = this.pool[slotIndex];
    if (!old) return;

    SpineSymbolPool.release(old.view, old.id);

    const view = SpineSymbolPool.acquire(newId, this.symbolSize);
    view.x = this.symbolSize / 2;
    view.y = slotIndex * this.symbolSize + this.symbolSize / 2;
    (view as unknown as { zIndex: number }).zIndex = slotIndex;

    this.stripContainer.addChild(view);

    this.pool[slotIndex] = { id: newId, view };
  }

  private refreshPool(baseRow: number): void {
    const ring = mod(baseRow, this.poolSize);

    for (let i = 0; i < this.poolSize; i++) {
      const logicalRow = baseRow + mod(i - ring, this.poolSize);
      const id = this.stripSymbols[mod(logicalRow, this.stripLength)]!;

      const slot = this.pool[i];
      if (slot && slot.id !== id) {
        this.replacePoolSlot(i, id);
      }
    }
  }

  private updatePosition(): void {
    const baseRow = Math.floor(this.currentOffset / this.symbolSize);
    const frac = this.currentOffset - baseRow * this.symbolSize;
    const ring = mod(baseRow, this.poolSize);

    this.stripContainer.y = -(ring * this.symbolSize + frac);

    if (baseRow !== this.lastBaseRow) {
      this.refreshPool(baseRow);
      this.lastBaseRow = baseRow;
    }

    // Compute viewport bounds in strip-container local coords
    const containerY = this.stripContainer.y;
    this.vpTop = -containerY;
    this.vpBottom = -containerY + this.visibleRows * this.symbolSize;

    // Wrap pool slots AFTER refresh, then cull + tick
    this.layoutAndCull(ring);
  }

  /**
   * Position each pool slot, set visible based on viewport intersection,
   * and tick only visible animated symbols.
   */
  private layoutAndCull(ring: number): void {
    // Reset frame counter once per frame
    _frameId++;
    if (_frameId !== _lastFrameId) {
      _spinesUpdatedThisFrame = 0;
      _lastFrameId = _frameId;
    }

    const half = this.symbolSize / 2;
    const buffer = this.symbolSize; // 1 symbol buffer outside viewport

    for (let i = 0; i < this.poolSize; i++) {
      const slot = this.pool[i];
      if (!slot) continue;

      // Ring-buffer wrapping
      const effectiveI = i < ring ? i + this.poolSize : i;
      const y = effectiveI * this.symbolSize + half;
      slot.view.y = y;

      // Viewport culling: symbol center ± half vs viewport ± buffer
      const symTop = y - half;
      const symBottom = y + half;
      const inViewport = symBottom > (this.vpTop - buffer) && symTop < (this.vpBottom + buffer);

      slot.view.visible = inViewport;

      // Animate only when idle (stopped) — during spin symbols blur past,
      // so updating Spine is wasted work
      if (inViewport && !this.isSpinning && slot.view.needsUpdate) {
        slot.view.tick(1 / 60);
        _spinesUpdatedThisFrame++;
      }
    }
  }

  public async spinTo(startIndex: number, duration = 2): Promise<void> {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const targetBase = startIndex * this.symbolSize;

    const currentMod = mod(this.currentOffset, this.stripLength * this.symbolSize);

    const stripHeight = this.stripLength * this.symbolSize;
    const distance = mod(targetBase - currentMod, stripHeight);

    const targetOffset = this.currentOffset + 2 * stripHeight + distance;

    await new Promise<void>((resolve) => {
      gsap.to(this, {
        currentOffset: targetOffset,
        duration,
        ease: 'expo.out',
        onUpdate: () => this.updatePosition(),
        onComplete: () => {
          this.isSpinning = false;
          resolve();
        },
      });
    });
  }

  /** Called every frame from the scene loop to tick idle animations. */
  public update(dt: number): void {
    if (this.isSpinning) return;

    _frameId++;
    if (_frameId !== _lastFrameId) {
      _spinesUpdatedThisFrame = 0;
      _lastFrameId = _frameId;
    }
    

    for (let i = 0; i < this.poolSize; i++) {
      const slot = this.pool[i];
      if (!slot) continue;
      if (slot.view.visible && slot.view.needsUpdate) {
        slot.view.tick(dt);
        _spinesUpdatedThisFrame++;
      }
    }
  }

  public getIsSpinning(): boolean {
    return this.isSpinning;
  }

  public override destroy(options?: Parameters<Container['destroy']>[0]): void {
    gsap.killTweensOf(this);
    for (const slot of this.pool) {
      SpineSymbolPool.release(slot.view, slot.id);
    }
    this.pool = [];
    super.destroy(options);
  }
}
