# Scenes

Cenas são containers visuais independentes gerenciados pelo SceneManager.

## BaseScene

Classe abstrata que define o ciclo de vida de uma cena:

- `init()` - Inicialização assíncrona (carregamento de assets)
- `onCreate()` - Template method para setup da cena
- `activate()` - Chamado quando cena se torna ativa
- `deactivate()` - Chamado quando cena é desativada
- `update(deltaTime)` - Loop de atualização por frame
- `destroy()` - Limpeza de recursos

## Ciclo de Vida

```
[Create] → init() → [Initialized]
          ↓
     activate() → [Active] → update() (loop)
          ↓
    deactivate() → [Inactive]
          ↓
      destroy() → [Destroyed]
```

## Implementação

Toda cena deve:
- Estender BaseScene
- Implementar onCreate()
- Implementar onUpdate()
- Limpar recursos em onDestroy()
