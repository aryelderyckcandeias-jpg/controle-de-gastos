# Guia de UI

Resumo da organização do CSS. Cada arquivo de `assets/css/` tem uma responsabilidade, descrita no comentário do início dele.

## Camadas do CSS

As páginas carregam os arquivos nesta ordem, do mais genérico ao mais específico:

| Ordem | Arquivo | Responsabilidade |
| --- | --- | --- |
| 1 | `variables.css` | Tokens do design system: tipografia, cores, espaçamentos. Só valores reutilizáveis |
| 2 | `reset.css` | Remove as diferenças entre os estilos padrão dos navegadores |
| 3 | `global.css` | Regras globais de toda a aplicação (sem componentes) |
| 4 | `components.css` | Componentes reutilizáveis e genéricos |
| 5 | `utilities.css` | Classes pequenas que fazem uma coisa só |
| 6 | `animations.css` | Animações curtas e discretas, reaproveitáveis |
| 7 | `<página>.css` | Estilos específicos de cada tela, em `pages/<página>/` |

Essa é a ordem usada nas páginas `home` e `cadastro`. A página de `login` ainda não carrega o `utilities.css`.

## Tipografia

A fonte da aplicação é a **Inter** (Google Fonts), com fontes do sistema como alternativa. A escala de tamanhos vai de `--font-size-xs` (0,75 rem) até `--font-size-4xl` (2,25 rem), e os pesos disponíveis são 400, 500, 600 e 700.

## Regras para novos estilos

- Valor reutilizável (cor, espaçamento, tamanho) vira variável em `variables.css`.
- Estilo de tela fica no CSS da própria página, não em `components.css`.
- Componente em `components.css` não deve depender de uma página específica.
