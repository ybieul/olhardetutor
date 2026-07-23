# Onboarding — Olhar de Tutor

Primeiro contato do usuário com o produto depois da compra. 4 etapas,
estado em Zustand persistido, e ao final cria o pet de verdade no
Supabase. Código em [`src/features/onboarding/`](../src/features/onboarding).

## Visão geral do fluxo

```
/onboarding
  Etapa 1 — Espécie        (StepSpecies.tsx)
  Etapa 2 — Fase de vida    (StepLifeStage.tsx)
  Etapa 3 — Perfil do pet   (StepProfile.tsx)
  Etapa 4 — DNA do pet      (StepBaseline.tsx)  → salva no Supabase → /home
```

[`OnboardingPage.tsx`](../src/features/onboarding/pages/OnboardingPage.tsx)
é o único componente com lógica de navegação/submit — cada `Step*.tsx` é
puramente apresentacional, lendo/escrevendo no store e recebendo erros de
validação já resolvidos via props. Um `ProgressBar` (componente já
existente no design system) mostra `etapa atual / 4` no topo.

A rota `/onboarding` é protegida por dois guards
([`src/routes/guards/`](../src/routes/guards)):

- `RequireAuth` — sem sessão, redireciona para `/login`.
- `PetGate require="no-pet"` — se o usuário já tem pet cadastrado,
  redireciona direto para `/home` (evita reonboarding acidental).

## Etapa 1 — Espécie

`SegmentedControl` no tamanho `lg` (variante nova, ver abaixo), duas
opções — Cão (`Dog`) e Gato (`Cat`), ícones lucide, sem emoji. Subtítulo
emocional vindo de `onboarding.json`. Sem seleção não avança: o botão
"Continuar" mostra `species.error` se a espécie não estiver escolhida.

## Etapa 2 — Fase de vida

Três cards selecionáveis (não é o `SegmentedControl` — space para
descrição não cabe num toggle compacto), um por `puppy`/`adult`/`senior`.
Cada card mostra rótulo, faixa etária **específica da espécie escolhida
na etapa 1**, e uma frase explicando por que aquela fase pede um olhar
diferente.

As faixas etárias são dados de negócio, não visuais nem i18n — vivem em
[`src/config/app.config.ts`](../src/config/app.config.ts),
`LIFE_STAGE_AGE_RANGES_MONTHS`:

| Espécie | Filhote    | Adulto    | Idoso               |
| ------- | ---------- | --------- | ------------------- |
| Cão     | 0–12 meses | 1–7 anos  | a partir de 7 anos  |
| Gato    | 0–12 meses | 1–11 anos | a partir de 11 anos |

São regras educativas (rules of thumb), não critério diagnóstico — o app
nunca diagnostica (ver `CLAUDE.md`). Os rótulos e os textos do intervalo
("a partir de X anos") vêm de `onboarding.json` com interpolação
(`{{min}}`, `{{max}}`); apenas os números vêm de `app.config.ts`.

## Etapa 3 — Perfil do pet

| Campo              | Componente                              | Obrigatório   | Mapeia para                                                  |
| ------------------ | --------------------------------------- | ------------- | ------------------------------------------------------------ |
| Nome               | `Input`                                 | Sim           | `pets.name`                                                  |
| Raça               | `Input` + `Checkbox` "Não sei/SRD"      | Não           | `pets.breed` (`null` se SRD)                                 |
| Data de nascimento | `Input type="date"` **ou**              | Um dos dois   | `pets.birth_date`                                            |
| Idade aproximada   | dois `Input type="number"` (anos/meses) | é obrigatório | `pets.birth_date` (calculado)                                |
| Peso atual (kg)    | `Input type="number"`                   | Sim           | `pets.initial_weight` **e** `weight_history` (linha inicial) |
| Foto               | upload + preview via `Avatar`           | Não           | `pets.photo_url` (caminho no Storage)                        |

Um `SegmentedControl` (tamanho padrão) alterna entre "Data de
nascimento" e "Idade aproximada". Quando o tutor só sabe a idade
aproximada, calculamos uma data de nascimento estimada
(`hoje − anos − meses`) — a tabela `pets` só tem uma coluna
`birth_date`, então a aproximação vira essa data; ver
`computeBirthDate()` em
[`petProfileHelpers.ts`](../src/features/onboarding/lib/petProfileHelpers.ts).

### Validação

Toda mensagem de erro vem de `onboarding.json` (namespace `profile.*`).
As regras (`validateProfileStep()`, mesmo arquivo de helpers):

- **Nome**: obrigatório, não pode ser só espaços.
- **Data de nascimento** (modo exato): precisa ser uma data válida e não
  pode estar no futuro.
- **Idade aproximada** (modo aproximado): pelo menos anos ou meses deve
  ser maior que zero.
- **Peso**: obrigatório, número maior que zero.
- Raça e foto são opcionais — nunca bloqueiam o avanço.

Erros só aparecem depois de uma tentativa de "Continuar" com o formulário
inválido (não no primeiro render).

### Upload de foto

O bucket `pet-photos` é privado (RLS por pasta do usuário — ver
`docs/SECURITY.md`). Como o pet ainda não existe nesta etapa, a foto é
enviada para `<uid>/onboarding-<timestamp>.<ext>` assim que o tutor a
escolhe (não espera até o fim do fluxo) — isso é o que permite a foto
sobreviver a um reload no meio do onboarding (ver "Persistência" abaixo):
só o **caminho** (uma string) fica no estado persistido, nunca o arquivo
`File` em si, que não sobrevive à serialização JSON do `localStorage`.

`uploadPetPhoto()` e `getPetPhotoUrl()` (ambas em
[`src/lib/supabase/queries/pets.ts`](../src/lib/supabase/queries/pets.ts))
cuidam do upload e da geração de uma signed URL temporária para exibir o
preview — a signed URL nunca é persistida (ela expira; o caminho, não).

## Etapa 4 — DNA do Pet (linha de base)

Tela explicativa (sem formulário): apresenta o conceito de que os
próximos `ONBOARDING_BASELINE_DAYS` dias (5, configurável em
`app.config.ts`) servem para aprender o que é **normal** para aquele pet
específico — não para diagnosticar nada. Um card mostra os 5 dias em
círculos numerados.

O botão principal muda de "Continuar" para "Começar"
(`nav.finish`) e dispara o submit final, orquestrado em
`OnboardingPage.handleFinish()`:

1. `upsertPet({...})` — cria a linha em `pets` com todos os campos
   coletados nas etapas 1–3.
2. Em paralelo (`Promise.allSettled`, melhor esforço — um erro aqui não
   desfaz o pet já criado nem trava o usuário):
   - `addWeightEntry({pet_id, date: hoje, weight_kg})` — semeia o
     histórico de peso com a primeira leitura.
   - `updateProfile({onboarding_completed: true})`.
3. Limpa o estado persistido (`reset()`).
4. `navigate('/home', {replace: true})`.

Se o passo 1 (criação do pet) falhar, nada disso acontece — o erro
aparece via `onboarding:baseline.submitError` e o tutor pode tentar de
novo sem perder o que já preencheu.

## Estado e persistência

[`useOnboardingStore`](../src/features/onboarding/store/useOnboardingStore.ts)
é uma store Zustand com o middleware `persist`, salva em
`localStorage` sob a chave `olhar-de-tutor:onboarding`. Guarda:

- `step` (1 a 4)
- `data` — todos os campos das etapas 1–3, incluindo o **caminho** da
  foto já enviada (nunca o arquivo)

Fechar a aba e voltar mais tarde restaura exatamente a etapa e os
valores preenchidos — inclusive o preview da foto, que é re-resolvido a
partir do caminho salvo (`getPetPhotoUrl`) quando `StepProfile` monta e
não há preview local ainda.

O estado é limpo (`reset()`) só quando o onboarding é concluído com
sucesso. Se o usuário abandonar o fluxo, o rascunho fica salvo
indefinidamente até ele voltar (ou limpar os dados do navegador).

## i18n

Todo o texto vem de `src/i18n/locales/{pt-BR,en}/onboarding.json`, um
único namespace cobrindo as 4 etapas (`species.*`, `lifeStage.*`,
`profile.*`, `baseline.*`) mais navegação compartilhada (`nav.*`,
`progress.*`). Nenhuma string literal nos componentes — trocar o idioma
no seletor já existente no app reflete instantaneamente em todo o fluxo,
incluindo mensagens de validação.

## Como testar manualmente

1. Logado, sem nenhum pet cadastrado, acesse `/onboarding` (ou tente
   `/home` diretamente — o `PetGate` deve redirecionar para cá).
2. Etapa 1: tente "Continuar" sem escolher espécie → vê o erro; escolha
   Cão ou Gato → avança.
3. Etapa 2: confira que as faixas etárias mudam se você voltar e trocar
   a espécie na etapa 1.
4. Etapa 3: tente avançar com o formulário vazio → vê os erros de nome e
   peso; marque "Não sei/SRD" e confirme que o campo de raça desabilita;
   envie uma foto e confirme o preview; recarregue a página no meio do
   preenchimento e confirme que tudo (inclusive a foto) volta.
5. Etapa 4: confirme o card com os 5 dias e clique em "Começar".
6. Confirme no Supabase Studio (tabela `pets`) que a linha foi criada com
   todos os campos, que `weight_history` ganhou uma linha, e que
   `profiles.onboarding_completed` virou `true`.
7. Confirme que você foi redirecionado para `/home`.
8. Troque o idioma (pt-BR ⇄ en) em qualquer etapa e confirme que todo o
   texto (títulos, subtítulos, rótulos, mensagens de erro) muda.
