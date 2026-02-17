# Domain Layer - Slot Machine

Lógica de negócio pura da slot machine, sem dependências de frameworks ou UI.

**Responsabilidade**: Lógica de negócio pura, independente de frameworks.

**Regra**: Pode importar apenas de `core/`.

## Arquitetura

### 1. Types (`types.ts`)
Tipos fundamentais do domínio:
- `SymbolId`: 10 símbolos únicos
- `Matrix`: Estrutura `[reelIndex][rowIndex]` para grid 5x4
- `LineWin`: Representa uma vitória em uma payline
- `SpinResult`: Resultado completo de um spin

### 2. RNG (`rng.ts`)
Interface de geração de números aleatórios:
- `DefaultRNG`: Usa `Math.random()`
- `SeededRNG`: Determinístico via seed incremental (ideal para testes)

### 3. ReelStrip (`reel-strip.ts`)
Lógica de construção e manipulação de strips:
- `buildReelStrip`: Cria strip baseado em pesos
- `shuffleStrip`: Fisher-Yates shuffle
- `extractVisibleSymbols`: Extrai símbolos visíveis com wrap-around

### 4. Paylines (`paylines.ts`)
10 paylines fixas para grid 5x4:
- Linhas 0-3: Horizontais
- Linhas 4-5: V shapes
- Linhas 6-7: Zigzags
- Linhas 8-9: W/M shapes

### 5. Paytable (`paytable.ts`)
Tabela de pagamentos:
- Mínimo 3 símbolos consecutivos
- Máximo 5 símbolos
- Valores progressivos (símbolos raros pagam mais)

### 6. SlotMachine (`slot-machine.ts`)
Classe principal com lógica de spin:

**Fluxo de Spin:**
1. Gera `startIndex` aleatório para cada reel
2. Extrai símbolos visíveis
3. Monta matrix 5x4
4. Avalia cada payline
5. Detecta sequências consecutivas (mínimo 3)
6. Aplica paytable
7. Multiplica por bet
8. Retorna `SpinResult`

**Regras:**
- Símbolos devem ser consecutivos da esquerda
- Para ao primeiro símbolo diferente
- Bet multiplica todos os payouts

### 7. RTP Simulator (`rtp-simulator.ts`)
Simulação de RTP com estatísticas completas

## Garantias

- ✅ 100% TypeScript strict
- ✅ Sem dependências externas
- ✅ Sem acesso a DOM/window
- ✅ Completamente testável
- ✅ Determinístico com SeededRNG
- ✅ Imutável onde apropriado
- ✅ Zero uso de `any`
