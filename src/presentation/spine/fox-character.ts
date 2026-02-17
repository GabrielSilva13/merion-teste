import { Spine } from '@esotericsoftware/spine-pixi-v8';
import gsap from 'gsap';
import { Container } from 'pixi.js';

export class FoxCharacter extends Container {
  private spine: Spine;

  constructor() {
    super();

    this.spine = Spine.from({ skeleton: 'foxSpine', atlas: 'foxAtlas' });
    this.addChild(this.spine);

    this.spine.state.setAnimation(0, 'Idle', true);
  }

  public playIdle(): void {
    this.spine.state.setAnimation(0, 'Idle', true);
  }

  public playWin(): void {
    this.spine.state.setAnimation(0, 'Win', false);
    this.spine.state.addAnimation(0, 'Idle', true, 0);
  }

  public playBigWin(): void {
    gsap.to(this.scale, {
      x: 1.3,
      y: 1.3,
      duration: 0.3,
      yoyo: true,
      repeat: 5,
      ease: 'back.out(2)',
    });
  }
}
