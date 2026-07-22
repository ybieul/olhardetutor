# Olhar de Tutor

PWA de acompanhamento preventivo da saúde e do comportamento de cães e gatos.
Educativo — não faz diagnósticos.

## Stack

- React 18 + Vite + TypeScript (strict)
- Tailwind CSS, orientado por design tokens em [`src/config/theme/`](src/config/theme)
- i18next + react-i18next (pt-BR / en), ver [`src/i18n/`](src/i18n)
- Zustand
- lucide-react
- Supabase (via [`src/lib/supabase/`](src/lib/supabase))

Regras de arquitetura permanentes estão em [`CLAUDE.md`](CLAUDE.md).

## Desenvolvimento

```bash
cp .env.example .env.local   # preencha as credenciais do Supabase
npm install
npm run dev
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (`tsc -b && vite build`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run format` — Prettier (escreve)
- `npm run format:check` — Prettier (checagem)
