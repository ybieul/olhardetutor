# Segurança e Privacidade — Olhar de Tutor

Este documento descreve as camadas de proteção implementadas na camada de
dados do Olhar de Tutor. O app roda no Brasil (LGPD) e nos EUA — cada
usuário só pode acessar os próprios dados, sem exceção.

Leia também: [`docs/ASSETS_GUIDE.md`](ASSETS_GUIDE.md) e
[`CLAUDE.md`](../CLAUDE.md) para as regras gerais de arquitetura.

## 1. Variáveis de ambiente

Toda variável de ambiente que o app front-end precisa é declarada e
validada em [`src/config/env.ts`](../src/config/env.ts). Se
`VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` estiverem ausentes, o app
falha no boot com uma mensagem clara em vez de quebrar silenciosamente
mais tarde. Ver [`.env.example`](../.env.example) para a lista completa.

A `service_role key` do Supabase **nunca** é uma variável `VITE_*` — ela
nunca entra no bundle do front-end. Ela só existe como uma variável de
ambiente injetada automaticamente pelo runtime de Edge Functions do
Supabase (`SUPABASE_SERVICE_ROLE_KEY`), disponível exclusivamente dentro
do código server-side em `supabase/functions/`. Ver seção 6.

## 2. Row Level Security (RLS)

RLS está habilitado em **todas as 6 tabelas** de aplicação. O modelo é
consistente:

| Tabela           | Coluna de posse          | Política                                                                |
| ---------------- | ------------------------ | ----------------------------------------------------------------------- |
| `profiles`       | `id` (= `auth.users.id`) | `id = auth.uid()`                                                       |
| `pets`           | `user_id`                | `user_id = auth.uid()`                                                  |
| `checkins`       | via `pet_id`             | `owns_pet(pet_id)` — verifica que o pet pertence ao usuário autenticado |
| `weight_history` | via `pet_id`             | `owns_pet(pet_id)`                                                      |
| `health_events`  | via `pet_id`             | `owns_pet(pet_id)`                                                      |
| `alerts`         | via `pet_id`             | `owns_pet(pet_id)`                                                      |

Cada tabela tem 4 políticas nomeadas (`select`/`insert`/`update`/`delete`),
todas escopadas `to authenticated` — a role `anon` nunca é mencionada em
nenhuma política, e nunca recebe `GRANT` nessas tabelas. Isso significa
duas camadas de negação para requisições não autenticadas: (1) falta de
`GRANT` bloqueia no nível SQL antes mesmo de avaliar RLS, e (2) mesmo que
houvesse `GRANT`, não existe política que libere a role `anon`. **Nenhuma
tabela é acessível sem autenticação.**

A função auxiliar `public.owns_pet(pet_id)`
([migration](../supabase/migrations/20260722040003_pets.sql)) centraliza a
checagem de posse usada por `checkins`, `weight_history`, `health_events`
e `alerts`, evitando duplicar a lógica de join em cada política.

### Prova de isolamento

[`supabase/tests/rls_isolation.sql`](../supabase/tests/rls_isolation.sql) é
uma suíte pgTAP com 24 asserções que:

- cria dois usuários (A e B), cada um com um pet e uma linha em cada
  tabela pet-scoped;
- autentica como A e confirma que A só enxerga os próprios dados —
  `SELECT` em qualquer tabela nunca retorna linhas de B;
- confirma que `UPDATE`/`DELETE` de A contra uma linha de B afeta **0
  linhas** (a cláusula `USING` filtra antes mesmo de tentar a operação);
- confirma que um `INSERT` de A referenciando o `pet_id` de B é
  **rejeitado** com erro (`WITH CHECK` falha);
- troca para B e confirma o espelho: B só vê os próprios dados, e o dado
  de B não foi alterado pela tentativa de A;
- troca para a role `anon` (sem JWT) e confirma que `SELECT`/`INSERT`
  são rejeitados com `permission denied` em `pets`, `profiles` e
  `checkins`;
- bônus: confirma que a constraint `unique(pet_id, date)` de `checkins`
  rejeita um segundo check-in do mesmo pet no mesmo dia.

Rodar localmente:

```bash
supabase start
supabase test db supabase/tests/rls_isolation.sql
```

**Nota de transparência:** o ambiente onde este projeto foi desenvolvido
não tem suporte a virtualização aninhada, então o Docker necessário para
`supabase start` não pôde ser executado aqui. As migrations foram
validadas offline com o parser real do PostgreSQL (via `libpg-query`,
mesmo parser usado pelo próprio Postgres) — sintaticamente corretas, com
a ordem de dependências (tabelas/tipos/funções) revisada manualmente. A
execução ao vivo do `supabase test db` fica pendente da primeira vez que
alguém rodar isso com Docker disponível; se algo precisar de ajuste (por
exemplo, colunas exatas de `auth.users` na versão do Supabase em uso),
o arquivo de teste é o lugar certo para corrigir.

## 3. Storage

Fotos de pet ficam no bucket privado `pet-photos`
([migration](../supabase/migrations/20260722040008_storage_pet_photos.sql)).
Toda política exige que o primeiro segmento do caminho do objeto seja
igual a `auth.uid()::text` — ou seja, cada usuário só lê/escreve dentro da
própria pasta (`<uid>/<arquivo>`). Não há política nem grant para `anon`.

## 4. Sanitização de entradas de texto livre

[`src/lib/security/sanitize.ts`](../src/lib/security/sanitize.ts) exporta
`sanitizeFreeText()`, aplicada a campos como `checkins.free_note` e
`health_events.description` antes de enviar ao banco.

Isso é defesa em profundidade, não a barreira principal: o React já
escapa toda interpolação de texto em JSX (`{valor}`) por padrão, então um
`<script>` armazenado nunca executa dentro do próprio app. O que
`sanitizeFreeText()` protege é tudo que **não** é React — a própria linha
armazenada, uma futura exportação em PDF/e-mail, uma ferramenta interna
de administração — removendo markup HTML e caracteres de controle antes
que cheguem lá.

**Regra permanente:** nunca usar `dangerouslySetInnerHTML` com conteúdo
vindo do usuário, com ou sem sanitização.

## 5. Headers de segurança (deploy na Vercel)

[`vercel.json`](../vercel.json) define, para todas as rotas:

- **Content-Security-Policy** — restringe scripts a `'self'` (nenhum
  script inline é permitido); estilos permitem `'unsafe-inline'` porque
  React define `style` como atributo inline em alguns componentes (ex.:
  `ProgressBar`, `AppImage`) — um trade-off comum e documentado, já que
  isso não abre a porta para execução de script; `connect-src`/`img-src`
  liberam `https://*.supabase.co` (ajuste para o domínio exato do projeto
  se quiser uma política mais restrita); `frame-ancestors 'none'` impede
  que o app seja embutido em um iframe de terceiros.
- **X-Frame-Options: DENY** e **X-Content-Type-Options: nosniff**.
- **Referrer-Policy: strict-origin-when-cross-origin**.
- **Permissions-Policy** — desabilita câmera, microfone, geolocalização e
  pagamentos, já que o app não usa nenhum desses.
- **Strict-Transport-Security** — força HTTPS por 2 anos, incluindo
  subdomínios.

## 6. LGPD / GDPR

### Exportar dados (portabilidade)

`exportUserData()` em
[`src/lib/supabase/queries/account.ts`](../src/lib/supabase/queries/account.ts)
monta um objeto JSON com o perfil do usuário e, para cada pet, todos os
check-ins, histórico de peso, eventos de saúde e alertas. É uma leitura
pura, inteiramente escopada por RLS — não precisa de privilégios
elevados. A tela que vai chamar essa função (e oferecer o download do
JSON) ainda não existe nesta fase.

### Excluir conta (direito ao esquecimento)

Apagar a linha de `auth.users` exige privilégios de admin que o cliente
nunca deve ter. `deleteAccount()` (mesmo arquivo) invoca a Edge Function
[`supabase/functions/delete-account/index.ts`](../supabase/functions/delete-account/index.ts),
que roda inteiramente no servidor:

1. valida a sessão de quem está chamando (não existe parâmetro "id do
   usuário a apagar" — só dá para apagar a si mesmo);
2. remove todos os arquivos do usuário no bucket `pet-photos`;
3. chama `auth.admin.deleteUser(id)`, que cascateia via
   `ON DELETE CASCADE` para `profiles`, `pets` e, através de `pets`, para
   `checkins`, `weight_history`, `health_events` e `alerts`.

Deploy: `supabase functions deploy delete-account`. A `service_role key`
usada lá dentro é injetada automaticamente pelo Supabase no runtime da
função — não é configurada manualmente em nenhum `.env`.

## 7. Nunca logar dados sensíveis

Nenhuma função de acesso a dados neste projeto loga o corpo de
requests/responses. Ao adicionar logging no futuro (analytics, Sentry,
etc.), nunca inclua `free_note`, `description`, nomes de pets/tutores ou
qualquer PII no payload do log — logue apenas identificadores técnicos
(ex.: `pet_id`, código de erro) quando fizer sentido para debugging.

## 8. Honestidade sobre limites

Nenhum sistema é 100% impenetrável. O que este documento descreve são as
camadas de proteção padrão da indústria — RLS no banco, sanitização de
entrada, headers de resposta, princípio do menor privilégio para chaves
— aplicadas de forma consistente neste projeto. Isso reduz drasticamente
a superfície de ataque e cobre os vetores mais comuns (vazamento entre
contas, XSS, exposição de segredos, clickjacking), mas não substitui:
revisões de segurança periódicas, testes de penetração antes de um
lançamento real, monitoramento de dependências vulneráveis, e um plano
de resposta a incidentes. À medida que o app cresce, esta lista deve
crescer junto.
