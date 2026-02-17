# 🎰 Slot Machine 5x4 — PixiJS Engine

Implementação profissional de uma slot machine **5x4** com arquitetura limpa, TypeScript em modo strict e renderização de alta performance usando PixiJS.

Projeto finalizado, com foco em **escalabilidade, testabilidade e performance mobile**.

---

# 🚀 Tech Stack

* **Runtime:** TypeScript 5.7+ (`strict: true`)
* **Renderer:** PixiJS 8.5
* **Animations:** GSAP 3.12
* **Skeletal Animation:** Spine (pixi-v8)
* **Build Tool:** Vite 6
* **Tests:** Vitest 2
* **Lint / Format:** Biome 1.9
* **Package Manager:** pnpm 9

---

# 🧱 Arquitetura

O projeto segue princípios de **Clean Architecture**, com separação clara entre regras de negócio e renderização.

```
src/
├── core/           # Tipos base, FSM, constantes
├── domain/         # Regras puras do jogo (RNG, Paylines, Paytable)
├── application/    # GameState e controllers
├── infrastructure/ # AssetLoader, Fake APIs
├── presentation/   # PixiJS scenes, UI e componentes
├── config/         # Configurações globais
└── tests/          # Helpers e mocks
```

### Princípios

* Domain 100% framework-agnostic
* Application não conhece PixiJS
* Presentation apenas renderiza
* Dependências fluem sempre para dentro

---

# 🎮 Design do Jogo

* Grid: **5 colunas × 4 linhas**
* 9 símbolos: ORANGE, GRAPE, BELL, BAR, SEVEN, DIAMOND, WILD, HANDCUFFS, BANK
* 10 paylines
* Win mínimo: 3 símbolos consecutivos (esquerda → direita)
* Payout: multiplicador × valor da bet
* RNG injetável (produção ou testes determinísticos)

---

# 🔄 Máquina de Estados (FSM)

Estados principais:

```
idle → spinning → evaluating → showingWin → idle
                             ↘ idle (sem win)
```

Características:

* FSM genérica e tipada
* Transições validadas em tempo de compilação
* Observer Pattern para UI reativa

---

# 🧩 Componentes Principais

## GameState

Gerencia:

* balance
* bet
* estado do jogo
* validações de operação

Fornece snapshot imutável via `getData()`.

---

## PixiApp

Wrapper da Application PixiJS:

* Renderer mobile-ready
* Loop customizado com deltaTime
* Resize responsivo
* Controle de lifecycle (`start()` / `stop()`)

---

## SceneManager

* Apenas uma cena ativa por vez
* Hot-swap seguro
* Cleanup automático

---

## BaseScene

Lifecycle padronizado:

```
init → activate → update → deactivate → destroy
```

Evita leaks e inconsistências.

---

# 📱 Estratégia Responsiva

* Base layout: **1280×720**
* Scaling dinâmico (`Math.max`)
* Bottom-aligned layout
* `100dvh` para viewport mobile
* Orientation lock + overlay CSS
* Debounce de resize (150ms)

---

# ⚡ Otimizações de Performance

## Object Pool

Pré-alocação de 36 Spines para eliminar GC durante gameplay.

## Viewport Culling

Renderiza apenas `visibleRows + 3` símbolos por reel.

## Animation Gating

* `autoUpdate: false`
* Tick manual apenas quando necessário.

## Warm Pool

Zero alocações no primeiro spin.

---

# 🏆 Sistema de Win Celebration

| Tier           | Multiplicador | Spine          |
| -------------- | ------------- | -------------- |
| Total Win      | < 20x         | Total_Win      |
| Mega Win       | 20x – 49x     | Mega_Win       |
| Super Mega Win | ≥ 50x         | Super_Mega_Win |

Overlay em tela cheia com animação loopada até interação do jogador.

---

# 🧪 Testes

* 95 testes unitários
* FSM, GameState, SlotMachine, RNG, Paylines, Paytable
* Fake API e RTP Simulator
* RNG determinístico (`SeededRNG`)
* `vi.useFakeTimers()` para simular latência

---

# 🎨 Padrões Utilizados

* Observer Pattern
* Template Method
* Facade
* Strategy
* Dependency Injection

---

# 🧾 Code Standards

* TypeScript strict mode
* Sem uso de `any`
* Apenas named exports
* Sem barrel files
* Biome para lint + format

---

# 🛠️ Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm test:ui
pnpm build
pnpm preview
pnpm lint
pnpm format
pnpm check
```

---

# 📊 Fluxo de Dados

```
User Action
    ↓
GameState
    ↓
FSM
    ↓
Observers (UI / Scenes)
    ↓
Pixi Renderer
```

---

# 🔐 License

Private
