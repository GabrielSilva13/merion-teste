# Decisões Arquiteturais — Slot Machine

## 1. Tech Stack

| Tecnologia | Motivo |
|---|---|
| **PixiJS 8.5** | Renderer WebGL de alta performance para 2D com aceleração por hardware |
| **Spine (pixi-v8)** | Animações esqueléticas ricas nos símbolos e celebrações de win |
| **GSAP 3.12** | Animações de spin dos reels com easing profissional (`expo.out`) |
| **TypeScript Strict** | Segurança de tipos máxima (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| **Vite** | Build rápido com code-splitting manual (PixiJS e GSAP em chunks separados) |
| **Vitest** | Testes unitários com ambiente jsdom, integrado ao Vite |

---

## 2. Arquitetura (Clean Architecture)

```
@core           → Utilidades genéricas (FSM)
@domain         → Lógica de negócio pura (SlotMachine, RNG, Paylines, Paytable)
@application    → Casos de uso (GameController, GameState)
@infrastructure → Adaptadores externos (FakeSlotApi, AssetLoader)
@presentation   → Renderização PixiJS (Scenes, Components, Spine, UI)
@config         → Configuração do app
```

**Princípio:** o Domain é 100% framework-agnostic. O Application orquestra sem saber que PixiJS existe. Isso permite testes unitários puros e troca futura de framework.

---

## 3. Design do Jogo

- **Grid:** 5 colunas × 4 linhas
- **9 Símbolos:** ORANGE, GRAPE, BELL, BAR, SEVEN, DIAMOND, WILD, HANDCUFFS, BANK
- **10 Paylines:** 4 retas + 6 padrões (V, V-invertido, zigzags)
- **Win mínimo:** 3 símbolos consecutivos da esquerda para a direita
- **Payout:** multiplicador base × valor da bet (ex: WILD 5x = 1000 × bet)
- **Pesos dos símbolos:** WILD aparece 2x na strip (raro), ORANGE/GRAPE/BELL/BAR/SEVEN 14x cada (comuns)

---

## 4. Máquina de Estados (FSM)

```
idle → spinning → evaluating → showingWin → idle
                             ↘ idle (sem win)
```

- FSM genérica e tipada (`FiniteStateMachine<TState>`)
- `transitionTo()` valida transições e lança erro se inválida
- Observer pattern propaga mudanças para a UI reativamente
- O controller chama `finishWinPresentation()` quando o jogador clica para dispensar a celebração

---

## 5. RNG (Gerador de Números Aleatórios)

| Implementação | Uso |
|---|---|
| `DefaultRNG` (Math.random) | Produção — spins e latência da API |
| `SeededRNG` (LCG: a=9301, c=49297, m=233280) | Testes — resultados determinísticos |

Injetado via factory pattern: `createSlotMachine({ seed })` para testes, `createSlotMachine()` para produção.

---

## 6. Estratégia Responsiva

- **Design base:** 1280×720 (landscape)
- **Scaling:** `Math.max(w/1280, h/720)` — preenche tela sem letterboxing
- **Alinhamento vertical:** bottom-aligned — a UI fica sempre visível, o crop acontece no topo
- **Reel area:** 60% da tela no desktop, 50% no mobile (detectado via `ontouchstart`)
- **Posição dos reels:** de baixo para cima (acima do painel UI), evitando sobreposição pela barra do navegador
- **Orientação:** lock via Screen Orientation API + overlay CSS "Gire o celular" em portrait
- **Resize:** debounce de 150ms para capturar mudanças de orientação atrasadas
- **Viewport:** `100dvh` (dynamic viewport height) para lidar com barras do navegador mobile

---

## 7. Otimizações de Performance

### Object Pool
Pré-aloca 4 instâncias Spine por tipo de símbolo (9 × 4 = 36) antes do primeiro spin. Elimina `Spine.from()` e `getBounds()` durante gameplay.

### Viewport Culling
Cada reel mantém `visibleRows + 3` símbolos no ring buffer. Símbolos fora da viewport são marcados como `visible = false` — posição é calculada, renderização é ignorada.

### Animation Gating
Todos os Spines criados com `autoUpdate: false`. Tick manual controlado por flags:
- **Frozen symbols** (letras): pose aplicada uma vez, nunca atualizada
- **Durante spin:** reduz updates (ou pause em símbolos não visíveis) para economizar CPU; no idle mantém animações onde agrega.
- **Idle:** apenas símbolos visíveis e não-frozen recebem `tick(dt)`

### Warm Pool
`SpineSymbolPool.warmUp(symbolSize)` chamado no `onCreate()` da scene. Zero alocações no primeiro spin.

---

## 8. Sistema de Win Celebration

| Tier | Condição (totalWin / bet) | Animação Spine |
|---|---|---|
| Total Win | multiplicador < 20x | `Total_Win.json` |
| Mega Win | 20x ≤ multiplicador < 50x | `Mega_Win.json` |
| Super Mega Win | multiplicador ≥ 50x | `Super_Mega_Win.json` |

- Overlay semi-transparente em tela cheia
- Spine escalado para 60% da tela com `Math.min` (preserva proporção)
- Animação em loop até o jogador clicar para dispensar
- Remoção via `pointerdown` no overlay → transição para `idle`

---

## 9. Layout da UI (Barra Inferior)

```
[ BALANCE 140px ] — 20px — [ TOTAL WON 140px ] — 20px — [ SPIN 120px ] — 55px — [ BET 140px ]
```

- **Painel:** 8% da altura da tela
- **Altura dos componentes:** 55px fixo
- **Gap extra antes do BET:** 35px adicionais para acomodar botões +/− externos (36px + 8px touch pad)
- **Spin button:** vermelho (idle), cinza (disabled), laranja (spinning)
- **Bet buttons:** posicionados fora do painel, com hit area invisível de 8px de padding para touch mobile
- **Font customizada:** Grobold (`/assets/fonts/GROBOLD.TTF`)

---

## 10. Preloader

- **HTML puro** — aparece instantaneamente sem depender de JS
- Imagem centralizada (`PRELOADER.jpg`) em fundo preto, `z-index: 10000`
- Removido com fade-out CSS (0.4s) após `app.initialize()` completar
- `transitionend` listener remove o elemento do DOM

---

## 11. Reatividade (Observer Pattern)

```
GameState ──subscribe──→ SlotScene.syncUI()
         ──onBalanceChange──→ UILayer.setBalance()
         ──onBetChange──→ UILayer.setBet()
         ──onStateChange──→ syncUI() (deriva estado dos botões)
```

Os botões de bet sempre derivam seu estado de `bet`, `balance`, `minBet` e `step` — sem flags manuais. O `syncUI()` recalcula a cada mudança.

---

## 12. Testes

- **95 testes** cobrindo: FSM, GameState, GameController, SlotMachine, RNG, ReelStrip, Paylines, Paytable, FakeSlotApi, RTP Simulator
- Testes determinísticos via `SeededRNG`
- `vi.useFakeTimers()` para testar latência da API e transições de estado
- Reels uniformes nos testes de win para independência do `startIndex` aleatório
