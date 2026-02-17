import { Assets } from 'pixi.js';

export async function loadGameAssets(): Promise<void> {
  // Load font via CSS @font-face so PixiJS Text can reference it by family name
  const font = new FontFace('Grobold', 'url(/assets/fonts/GROBOLD.TTF)');
  const loaded = await font.load();
  document.fonts.add(loaded);

  await Assets.load([
    // BACKGROUND
    { alias: 'bgMain', src: '/assets/background/bg_main.png' },

    // FOX
    { alias: 'foxSpine', src: '/assets/spine/fox/Fox.json' },
    {
      alias: 'foxAtlas',
      src: '/assets/spine/fox/Fox.atlas',
    },

    // BANK
    { alias: 'bankSkeleton', src: '/assets/spine/bank/Bank.json' },
    { alias: 'bankAtlas', src: '/assets/spine/bank/Bank.atlas' },

    // SAFE
    { alias: 'safeSkeleton', src: '/assets/spine/safe/Safe.json' },
    { alias: 'safeAtlas', src: '/assets/spine/safe/Safe.atlas' },

    // COIN
    { alias: 'coinSkeleton', src: '/assets/spine/coin/Golden_coins.json' },
    { alias: 'coinAtlas', src: '/assets/spine/coin/Golden_coins.atlas' },

    // DYNAMIT
    { alias: 'dynamiteSkeleton', src: '/assets/spine/dynamit/Dynamite.json' },
    { alias: 'dynamiteAtlas', src: '/assets/spine/dynamit/Dynamite.atlas' },

    // HANDCUFFS
    { alias: 'handcuffsSkeleton', src: '/assets/spine/handcuffs/Handcuffs.json' },
    { alias: 'handcuffsAtlas', src: '/assets/spine/handcuffs/Handcuffs.atlas' },

    // LETTERS
    { alias: 'lettersSkeleton', src: '/assets/spine/letters/LETTERS.json' },
    { alias: 'lettersAtlas', src: '/assets/spine/letters/LETTERS.atlas' },

    // WIN CELEBRATIONS
    { alias: 'totalWinSkeleton', src: '/assets/spine/total-win/Total_Win.json' },
    { alias: 'totalWinAtlas', src: '/assets/spine/total-win/Total_Win.atlas' },

    { alias: 'megaWinSkeleton', src: '/assets/spine/mega-win/Mega_Win.json' },
    { alias: 'megaWinAtlas', src: '/assets/spine/mega-win/Mega_Win.atlas' },

    { alias: 'superMegaWinSkeleton', src: '/assets/spine/super-mega-win/Super_Mega_Win.json' },
    { alias: 'superMegaWinAtlas', src: '/assets/spine/super-mega-win/Super_Mega_Win.atlas' },
  ]);
}
