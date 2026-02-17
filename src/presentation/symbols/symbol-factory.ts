import type { SymbolId } from '@domain/types';
import { SpineSymbol } from './spine-symbol';

export namespace SymbolFactory {
  export function create(symbolId: SymbolId, symbolSize: number): SpineSymbol {
    switch (symbolId) {
      case 'BANK':
        return new SpineSymbol({
          skeleton: 'bankSkeleton',
          atlas: 'bankAtlas',
          idleAnimation: 'Bank',
          symbolSize,
        });

      case 'HANDCUFFS':
        return new SpineSymbol({
          skeleton: 'handcuffsSkeleton',
          atlas: 'handcuffsAtlas',
          idleAnimation: 'animation',
          symbolSize,
          freezeIdleFrame: true,
        });

      case 'ORANGE':
        return new SpineSymbol({
          skeleton: 'safeSkeleton',
          atlas: 'safeAtlas',
          idleAnimation: 'animation',
          activeRootBone: 'Safe_main',
          symbolSize,
        });

      case 'GRAPE':
        return new SpineSymbol({
          skeleton: 'lettersSkeleton',
          atlas: 'lettersAtlas',
          idleAnimation: 'A_simbol',
          activeRootBone: 'A_simbol',
          freezeIdleFrame: true,
          symbolSize,
        });

      case 'BELL':
        return new SpineSymbol({
          skeleton: 'lettersSkeleton',
          atlas: 'lettersAtlas',
          idleAnimation: 'J_animation',
          activeRootBone: 'J_simbol',
          freezeIdleFrame: true,
          symbolSize,
        });

      case 'BAR':
        return new SpineSymbol({
          skeleton: 'lettersSkeleton',
          atlas: 'lettersAtlas',
          idleAnimation: 'K_animation',
          activeRootBone: 'K_simbol',
          freezeIdleFrame: true,
          symbolSize,
        });

      case 'SEVEN':
        return new SpineSymbol({
          skeleton: 'lettersSkeleton',
          atlas: 'lettersAtlas',
          idleAnimation: 'Q_animation',
          activeRootBone: 'Q_simbol',
          freezeIdleFrame: true,
          symbolSize,
        });

      case 'DIAMOND':
        return new SpineSymbol({
          skeleton: 'lettersSkeleton',
          atlas: 'lettersAtlas',
          idleAnimation: 'Number_animation',
          activeRootBone: ['Number_simbol', '1_simbol', '0_simbol'],
          freezeIdleFrame: true,
          symbolSize,
        });

      case 'WILD':
        return new SpineSymbol({
          skeleton: 'dynamiteSkeleton',
          atlas: 'dynamiteAtlas',
          idleAnimation: 'animation',
          symbolSize,
          scaleMultiplier: 3,
        });

      default:
        throw new Error(`Unknown symbol: ${symbolId}`);
    }
  }
}
