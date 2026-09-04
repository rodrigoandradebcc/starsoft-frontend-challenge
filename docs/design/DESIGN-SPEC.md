# Design Spec — Starsoft NFT Marketplace

Extraído dos screenshots do Figma em `docs/design/`:

- `01-home-grid.png` — home / listagem
- `02-design-system.png` — paleta, tipografia, estados de botão
- `03-cart-overlay.png` — overlay de checkout (mochila de compras)

## Design tokens

### Cores

| Token                | Hex       | Uso                                                                 |
| -------------------- | --------- | ------------------------------------------------------------------- |
| `$color-primary`     | `#FF8310` | Botões primários, logo, ícones de destaque, barra de progresso      |
| `$color-surface`     | `#232323` | Fundo dos cards, linhas do carrinho                                 |
| `$color-background`  | `#191A20` | Fundo da página, thumbnails                                         |
| `$color-surface-alt` | `#393939` | Botão secundário (Carregar mais), botão circular de voltar, stepper |
| `$color-text-muted`  | `#CCCCCC` | Descrições, footer                                                  |
| `$color-text`        | `#FFFFFF` | Títulos, preços, labels                                             |

### Tipografia

- Família: **Poppins** (carregar via `next/font/google`)
- Título de card: ~16px, weight 500, branco
- Descrição: ~12px, weight 400, `#CCCCCC`
- Preço: ~16px, weight 600, branco
- Label de botão: uppercase, weight 600, letter-spacing leve
- Footer: uppercase, ~11px, `#CCCCCC`

### Outros

- `border-radius: 8px` global (cards, botões, thumbnails, steppers)
- Botões circulares (voltar, deletar) são círculos completos

## Layout — Home (`01-home-grid.png`)

**Header** (sticky, fundo `#191A20`, borda inferior 1px sutil)

- Esquerda: wordmark "starsoft" em `#FF8310`, fonte arredondada custom
- Direita: ícone de sacola (contorno laranja) + contador numérico branco
- Clique abre o overlay do carrinho

**Grid de produtos**

- 4 colunas em desktop, container centralizado com max-width (~1350px)
- Card: fundo `#232323`, radius 8, padding ~20px
- Thumbnail: quadrado, fundo `#191A20`, radius 8, imagem centralizada com padding interno
- Ordem do conteúdo: título → descrição → linha de preço (ícone ETH + "32 ETH") → botão COMPRAR full-width
- Gap entre cards ~24px

**Paginação**

- Barra de progresso acima do botão: trilho `#393939`, preenchimento `#FF8310`, proporcional a itens carregados / total
- Botão "Carregar mais": fundo `#393939`, texto branco, centralizado, largura fixa (~370px)
- Estado final: barra 100% laranja + botão vira "Você já viu tudo" (desabilitado)

**Footer**

- "STARSOFT © TODOS OS DIREITOS RESERVADOS" centralizado, uppercase, `#CCCCCC`

## Estados de botão (`02-design-system.png`)

| Componente  | Estado              | Visual                                     |
| ----------- | ------------------- | ------------------------------------------ |
| `buy-bt`    | padrão              | "COMPRAR"                                  |
| `buy-bt`    | adicionado          | "ADICIONADO AO CARRINHO" laranja `#FF8310` |
| `finish-bt` | padrão              | "FINALIZAR COMPRA" laranja, full-width     |
| `finish-bt` | concluído           | "COMPRA FINALIZADA!" laranja, full-width   |
| `load-bt`   | com itens restantes | barra parcial + "Carregar mais" `#393939`  |
| `load-bt`   | fim da lista        | barra 100% + "Você já viu tudo"            |

> **AMBIGUIDADE A RESOLVER:** no design system o `buy-bt` aparece com "COMPRAR" em cinza `#393939` e "ADICIONADO AO CARRINHO" em laranja, mas na home (`01-home-grid.png`) o "COMPRAR" é laranja. Implementar seguindo a home (COMPRAR laranja → ADICIONADO AO CARRINHO laranja com texto trocado) e confirmar com o usuário.

## Overlay de checkout (`03-cart-overlay.png`)

- Drawer/painel sobre a página, fundo escuro, com backdrop escurecido
- Topo: botão circular de voltar (círculo `#393939`, seta `#FF8310`) + título "Mochila de Compras" (branco, ~20px, weight 500)
- Linha de item: fundo `#232323`, radius 8
  - Thumbnail quadrado à esquerda (~80px, radius 8)
  - Título do item uppercase (ex.: "ITEM 2"), descrição `#CCCCCC`, preço com ícone ETH
  - Stepper de quantidade: pílula com borda, `−  1  +`
  - Botão circular laranja com ícone de lixeira à direita, alinhado ao fim da linha
- Rodapé do painel: "TOTAL" à esquerda (bold, uppercase) + ícone ETH + total em ETH à direita
- Botão "FINALIZAR COMPRA" laranja, full-width, radius 8

## Assets necessários

- Ícone ETH (losango azul/roxo com diamante) — SVG inline
- Ícone de sacola (contorno) — SVG inline
- Ícone de lixeira — SVG inline
- Seta de voltar — SVG inline
- Wordmark "starsoft" — SVG ou fonte arredondada com fallback
- 8+ imagens de itens de fantasia (cajado, lanterna caveira, poção, livro, orbe, armadura, pena, maça) em `/public/images/` — geradas ou substituídas por placeholders locais, sem host externo
