import { getSpinesUpdatedThisFrame } from '../components/reel-view';
import { SpineSymbolPool } from '../symbols/spine-symbol-pool';

/**
 * Lightweight DOM-based performance overlay.
 * Toggle via `PerfOverlay.toggle()` or press F2.
 *
 * Shows:
 * - FPS (rolling average)
 * - Spines updated this frame
 * - Pool size (instances stored)
 */
export namespace PerfOverlay {
  let el: HTMLDivElement | null = null;
  let rafId = 0;
  let lastTime = performance.now();
  let frames = 0;
  let fps = 0;

  export function toggle(): void {
    if (el) {
      hide();
    } else {
      show();
    }
  }

  export function show(): void {
    if (el) return;

    el = document.createElement('div');
    el.style.cssText =
      'position:fixed;top:8px;left:8px;background:rgba(0,0,0,0.75);color:#0f0;' +
      'font:12px monospace;padding:6px 10px;z-index:99999;pointer-events:none;' +
      'border-radius:4px;line-height:1.5;white-space:pre';
    document.body.appendChild(el);

    tick();
  }

  export function hide(): void {
    if (!el) return;
    cancelAnimationFrame(rafId);
    el.remove();
    el = null;
  }

  function tick(): void {
    frames++;
    const now = performance.now();
    const delta = now - lastTime;

    if (delta >= 500) {
      fps = Math.round((frames * 1000) / delta);
      frames = 0;
      lastTime = now;
    }

    if (el) {
      const spines = getSpinesUpdatedThisFrame();
      const pooled = SpineSymbolPool.pooledCount();
      el.textContent =
        `FPS:    ${fps}\n` +
        `Spines: ${spines}/frame\n` +
        `Pool:   ${pooled} stored`;
    }

    rafId = requestAnimationFrame(tick);
  }
}

// F2 to toggle
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F2') PerfOverlay.toggle();
  });
}
