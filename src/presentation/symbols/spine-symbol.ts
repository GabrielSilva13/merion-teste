import { Physics } from '@esotericsoftware/spine-core';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { Container } from 'pixi.js';

export interface SpineSymbolConfig {
  readonly skeleton: string;
  readonly atlas: string;
  readonly idleAnimation: string;
  readonly winAnimation?: string;
  readonly symbolSize: number;
  readonly activeRootBone?: string | string[];
  readonly freezeIdleFrame?: boolean;
  readonly scaleMultiplier?: number;
}

export class SpineSymbol extends Container {
  private readonly spine: Spine;
  private readonly idleAnimation: string;
  private readonly winAnimation?: string | undefined;
  private readonly activeRootBone?: string | string[] | undefined;
  private readonly freezeIdleFrame?: boolean | undefined;

  /** True when this symbol has an active animation that needs per-frame updates. */
  private _needsUpdate = false;

  constructor(config: SpineSymbolConfig) {
    super();

    this.idleAnimation = config.idleAnimation;
    this.winAnimation = config.winAnimation;
    this.activeRootBone = config.activeRootBone;
    this.freezeIdleFrame = config.freezeIdleFrame;

    this.spine = Spine.from({
      skeleton: config.skeleton,
      atlas: config.atlas,
      autoUpdate: false,
    });

    this.addChild(this.spine);

    this.applyIdlePose();

    const bounds = this.spine.getBounds();
    const baseScale = config.symbolSize / Math.max(bounds.width, bounds.height);
    const mult = config.scaleMultiplier ?? 1;
    this.spine.scale.set(baseScale * mult);

    this.spine.update(0);

    const scaled = this.spine.getBounds();
    this.spine.pivot.set(scaled.x + scaled.width / 2, scaled.y + scaled.height / 2);
  }

  /** Whether this symbol needs a tick() call this frame. */
  public get needsUpdate(): boolean {
    return this._needsUpdate;
  }

  /** Manual update — called only by the reel's culling loop. */
  public tick(dt: number): void {
    if (!this._needsUpdate) return;
    this.spine.update(dt);
  }

  private applyIdlePose(): void {
    this.spine.skeleton.setToSetupPose();
    this.spine.state.clearTrack(0);

    if (this.freezeIdleFrame) {
      const anim = this.spine.skeleton.data.findAnimation(this.idleAnimation);
      if (!anim) throw new Error(`Animation not found: ${this.idleAnimation}`);

      const isLettersMode = !!this.activeRootBone || !!this.freezeIdleFrame;

      if (!isLettersMode) {
        this.spine.skeleton.setToSetupPose();
        this.spine.state.setAnimation(0, this.idleAnimation, true);
        this.spine.state.apply(this.spine.skeleton);
        this.spine.skeleton.updateWorldTransform(Physics.update);
        this.spine.update(0);
        this._needsUpdate = false;
        return;
      }

      const entry = this.spine.state.setAnimation(0, this.idleAnimation, false);
      (entry).trackTime = anim.duration;

      this.spine.state.apply(this.spine.skeleton);
      this.spine.skeleton.updateWorldTransform(Physics.update);

      this.spine.state.clearTrack(0);
    } else {
      this.spine.state.setAnimation(0, this.idleAnimation, true);
      this.spine.state.apply(this.spine.skeleton);
      this.spine.skeleton.updateWorldTransform(Physics.update);
    }

    if (this.activeRootBone) {
      this.enforceActiveRoots(this.activeRootBone);
      this.spine.skeleton.updateWorldTransform(Physics.update);
    }

    this.spine.update(0);

    // Frozen symbols don't need per-frame updates
    this._needsUpdate = !this.freezeIdleFrame;
  }

  private enforceActiveRoots(active: string | string[]): void {
    const activeSet = new Set(Array.isArray(active) ? active : [active]);

    for (const bone of this.spine.skeleton.bones) {
      if (!bone.data.name.endsWith('_simbol')) continue;

      if (activeSet.has(bone.data.name)) {
        if (bone.scaleX === 0) bone.scaleX = 1;
        if (bone.scaleY === 0) bone.scaleY = 1;
      } else {
        bone.scaleX = 0;
        bone.scaleY = 0;
      }
    }
  }

  public playIdle(): void {
    if (this.freezeIdleFrame) {
      this.applyIdlePose();
      return;
    }

    this.spine.skeleton.setToSetupPose();
    this.spine.state.setAnimation(0, this.idleAnimation, true);
    this.spine.state.apply(this.spine.skeleton);
    this.spine.skeleton.updateWorldTransform(Physics.update);

    if (this.activeRootBone) {
      this.enforceActiveRoots(this.activeRootBone);
      this.spine.skeleton.updateWorldTransform(Physics.update);
    }

    this.spine.update(0);
    this._needsUpdate = true;
  }

  public playWin(): void {
    if (!this.winAnimation) return;

    this.spine.state.setAnimation(0, this.winAnimation, false);

    if (!this.freezeIdleFrame) {
      this.spine.state.addAnimation(0, this.idleAnimation, true, 0);
    }

    this._needsUpdate = true;
  }

  /** Pause/resume the spine ticker (for pool storage). */
  public setAutoUpdate(enabled: boolean): void {
    // autoUpdate stays permanently OFF — this just controls _needsUpdate
    this._needsUpdate = enabled;
  }

  public override destroy(options?: boolean | Parameters<Container['destroy']>[0]): void {
    this.spine.destroy();
    super.destroy(options);
  }
}
