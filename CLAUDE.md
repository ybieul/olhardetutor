# Regras de Arquitetura — Olhar de Tutor

Olhar de Tutor é um PWA de acompanhamento preventivo da saúde e do
comportamento de cães e gatos. O app é educativo e **não faz diagnósticos**.
Público internacional (Brasil e EUA) — internacionalização é requisito de
primeira classe, não um extra.

## Proibições absolutas

- PROIBIDO hardcoding de qualquer valor visual (cor, fonte, tamanho,
  espaçamento, raio, sombra). Tudo vem de `src/config/theme/`.
- PROIBIDO texto literal na interface. Todo texto vem de `src/i18n/locales`
  via `useTranslation()`. Nem uma palavra hardcoded.
- PROIBIDO emoji. Usar exclusivamente `lucide-react` para ícones, sempre
  através do wrapper `src/components/ui/Icon.tsx` — nunca `lucide-react`
  direto fora dele.
- PROIBIDO caminho de imagem literal. Toda imagem estática do app (logo,
  ilustração, ícone de PWA) vem de uma chave em
  `src/config/assets.config.ts` e é renderizada via
  `src/components/ui/AppImage.tsx` — nunca `<img src="...">` direto com
  caminho fixo. Ver `docs/ASSETS_GUIDE.md` para nome de arquivo, pasta e
  dimensões de cada chave.
- PROIBIDO segredo/credencial no código. Tudo em variáveis de ambiente
  validadas em `src/config/env.ts`.

## Padrões obrigatórios

- TypeScript estrito (`strict: true`). Sem `any` sem justificativa.
- Organização por feature em `src/features/`.
- Componentes de UI genéricos em `src/components/ui/`, sempre consumindo tokens.
- Toda query ao Supabase passa por `src/lib/supabase/` com tipos.
- Responsividade total: mobile-first, testado até desktop.
- Componentes pequenos, com responsabilidade única. Funções puras quando possível.
- Nomes de arquivos e código em inglês; textos de UI via i18n.

## Idiomas suportados

- `pt-BR` (padrão Brasil) e `en` (padrão EUA). Detecção automática por
  navegador, com opção de troca manual persistida.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS (configurado para ler design tokens de `src/config/theme/`)
- i18next + react-i18next + i18next-browser-languagedetector
- Zustand (estado)
- lucide-react (ícones)
- ESLint + Prettier
