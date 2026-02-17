# Arquitetura da Engine Gráfica

## Visão Geral

Sistema modular baseado em Clean Architecture com separação clara de responsabilidades.

## Componentes Principais

### 1. FSM (Finite State Machine)
**Localização**: `src/core/fsm.ts`

Máquina de estados genérica e tipada que:
- Garante transições válidas entre estados
- Suporta observers (padrão Observer)
- Previne estados inválidos em tempo de compilação via TypeScript

Estados do jogo:
- `idle` → `spinning`
- `spinning` → `evaluating`
- `evaluating` → `showingWin` | `idle`
- `showingWin` → `idle`

### 2. GameState
**Localização**: `src/application/game-state.ts`

Gerenciador de estado do jogo que:
- Encapsula FSM internamente
- Gerencia balance e bet
- Valida operações (bet não pode exceder balance)
- Notifica observers de mudanças
- Fornece snapshot imutável via `getData()`

### 3. PixiApp
**Localização**: `src/presentation/pixi-app.ts`

Wrapper da Application do PixiJS que:
- Inicializa renderer com configurações mobile-ready
- Gerencia stage root container
- Implementa loop de update com deltaTime
- Suporta resize responsivo e orientationchange
- Expõe métodos `start()` e `stop()`

### 4. SceneManager
**Localização**: `src/presentation/scene-manager.ts`

Gerenciador de cenas que:
- Registra e desregistra cenas
- Controla transição entre cenas
- Remove cena anterior corretamente
- Propaga update para cena ativa
- Previne múltiplas cenas simultâneas

### 5. BaseScene
**Localização**: `src/presentation/scenes/base-scene.ts`

Classe abstrata para cenas com:
- Ciclo de vida definido (init → activate → update → deactivate → destroy)
- Template methods para subclasses
- Proteção contra múltiplas inicializações
- Visibilidade controlada

## Fluxo de Dados

```
User Action
    ↓
GameState (valida + atualiza)
    ↓
FSM (valida transição)
    ↓
Observers (UI + Scenes)
    ↓
PixiApp (renderiza)
```

## Decisões Arquiteturais

### Por que FSM genérica?
- Reutilizável para outros estados (UI, animações)
- Type-safe: TypeScript garante estados válidos
- Testável independentemente

### Por que GameState separado?
- Single Responsibility: lógica de negócio isolada
- Não depende de PixiJS
- Facilita testes unitários
- Pode ser usado em server-side rendering

### Por que PixiApp wrapper?
- Abstrai complexidade do PixiJS Application
- Centraliza configuração mobile
- Facilita troca de engine gráfica futuramente
- Loop de update customizável

### Por que SceneManager?
- Evita acoplamento entre cenas
- Gerencia memória (destroy de cena anterior)
- Permite hot-swap de cenas
- Facilita debugging (uma cena ativa por vez)

### Por que BaseScene abstrata?
- Força consistência no ciclo de vida
- Previne esquecimento de cleanup
- Template Method pattern
- Facilita debugging (hooks bem definidos)

## Padrões Utilizados

1. **Observer Pattern**: FSM, GameState
2. **Template Method**: BaseScene
3. **Facade**: PixiApp
4. **Strategy**: SceneManager
5. **Dependency Injection**: Via constructor

## Testabilidade

- FSM: 100% testável (lógica pura)
- GameState: 100% testável (não depende de DOM/PixiJS)
- Scenes: Testável via mocks do PixiJS
- Integration tests: Vitest + jsdom

## Próximos Passos

- Implementar SlotScene
- Criar sistema de símbolos
- Adicionar animações GSAP
- Implementar cálculo de vitórias
