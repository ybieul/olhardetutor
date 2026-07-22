# Guia de Assets — Olhar de Tutor

Como funciona: cada linha da tabela abaixo é uma **chave semântica** já
registrada em [`src/config/assets.config.ts`](../src/config/assets.config.ts)
e consumida pelo app via
[`AppImage`](../src/components/ui/AppImage.tsx).

Para publicar (ou substituir) um asset, basta colar um arquivo com o
**nome exato** na **pasta exata** indicados abaixo. Nenhuma alteração de
código é necessária — `AppImage` já está apontando para esse caminho. Se o
arquivo ainda não existir (ou falhar ao carregar), `AppImage` mostra um
placeholder neutro em vez de quebrar.

Todos os caminhos são relativos a `public/`, então um arquivo em
`public/assets/logos/logo-primary.svg` fica disponível em `/assets/logos/logo-primary.svg`.

## Tabela de assets

| Chave                  | Arquivo (nome exato)         | Pasta de destino               | Dimensões recomendadas | Formato | Fundo                 | Onde é usado                                                                                                                        |
| ---------------------- | ---------------------------- | ------------------------------ | ---------------------- | ------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `logoPrimary`          | `logo-primary.svg`           | `public/assets/logos/`         | 320×80 px              | SVG     | Transparente          | Logo principal (marca + símbolo) — telas de login, onboarding, cabeçalhos onde há espaço horizontal                                 |
| `logoIcon`             | `logo-icon.svg`              | `public/assets/logos/`         | 128×128 px             | SVG     | Transparente          | "O Sinal" — o ícone-símbolo da marca (já definido). Usado no rail de navegação desktop, favicon-like contexts e como marca compacta |
| `logoWhite`            | `logo-white.svg`             | `public/assets/logos/`         | 320×80 px              | SVG     | Transparente          | Variante clara do `logoPrimary`, para uso sobre fundos escuros/imagens (ex.: hero escuro, modo escuro futuro)                       |
| `splashLogo`           | `splash-logo.svg`            | `public/assets/logos/`         | 256×256 px             | SVG     | Transparente          | Tela de splash/carregamento inicial do PWA                                                                                          |
| `onboardingSpeciesDog` | `onboarding-species-dog.svg` | `public/assets/onboarding/`    | 320×320 px             | SVG     | Transparente          | Etapa de seleção de espécie do onboarding — opção "Cão"                                                                             |
| `onboardingSpeciesCat` | `onboarding-species-cat.svg` | `public/assets/onboarding/`    | 320×320 px             | SVG     | Transparente          | Etapa de seleção de espécie do onboarding — opção "Gato"                                                                            |
| `emptyStatePet`        | `empty-state-pet.svg`        | `public/assets/illustrations/` | 280×280 px             | SVG     | Transparente          | Estado vazio da Home quando o tutor ainda não cadastrou nenhum pet                                                                  |
| `placeholderAvatar`    | `placeholder-avatar.svg`     | `public/assets/illustrations/` | 128×128 px             | SVG     | Transparente          | Ilustração de placeholder para foto de pet — complementa o fallback de ícone do componente `Avatar`                                 |
| `pwaIcon192`           | `icon-192.png`               | `public/assets/pwa/`           | 192×192 px             | PNG     | Sólido (cor da marca) | Ícone do PWA (manifest, atalho na tela inicial Android/desktop)                                                                     |
| `pwaIcon512`           | `icon-512.png`               | `public/assets/pwa/`           | 512×512 px             | PNG     | Sólido (cor da marca) | Ícone do PWA em alta resolução (splash gerado pelo SO, ícone maskable, lojas)                                                       |

## Notas

- **SVG** é o formato padrão para logos e ilustrações porque escala sem
  perda em qualquer densidade de tela. **PNG** é reservado para os ícones
  de PWA (`pwaIcon192`/`pwaIcon512`), que precisam de pixels exatos para o
  manifest do navegador — não use SVG nesses dois.
- **Fundo sólido** nos ícones de PWA existe porque o Android/iOS podem
  recortar o ícone em formas diferentes (maskable icons); um fundo
  transparente resulta em bordas cortadas de forma inconsistente.
- **Versões claras/escuras**: `logoPrimary` é a versão padrão (fundos
  claros); `logoWhite` é a variante para fundos escuros. Use a chave
  correta conforme o contexto — não aplique filtros CSS para simular a
  inversão.
- Nomes de arquivo, chaves e pastas devem bater **exatamente** com esta
  tabela — `AppImage` faz o lookup pela chave em
  `src/config/assets.config.ts`, que por sua vez aponta para o caminho
  literal. Qualquer divergência de nome resulta no asset não sendo
  encontrado (e o fallback sendo exibido).

## Adicionando uma nova chave

Se um novo asset for necessário além dos listados acima:

1. Adicione a chave e o caminho em `ASSET_PATHS` em
   `src/config/assets.config.ts`.
2. Adicione uma linha nesta tabela com o mesmo nome de arquivo/pasta.
3. Use `<AppImage assetKey="..." alt={t(...)} />` no componente que precisa
   exibi-la — nunca um `<img src="...">` com caminho literal (ver
   `CLAUDE.md`).
