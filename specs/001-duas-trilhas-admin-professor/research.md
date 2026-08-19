# Research: Duas Trilhas e Área Administrativa do Professor

## 1. Runtime e hospedagem do backend mínimo

**Decision** (revisado 2026-08-18): monolito Node.js + Express, hospedado como
**Render Web Service** (tier gratuito), servindo tanto a API (`/api/*`) quanto os
arquivos estáticos do jogo (`public/index.html`, `public/admin.html`) no mesmo
processo/origem.

**Histórico**: a decisão original desta seção era Cloudflare Workers (serverless).
O usuário optou por rodar tudo como monolito, já que a aplicação já estava hospedada
de forma estática no Render — um único Web Service Node é a forma mais direta de
chegar lá sem introduzir uma segunda plataforma (Cloudflare) só para a API.

**Rationale**: um único serviço para implantar (sem coordenar dois provedores
diferentes); mesma origem para front-end e API elimina CORS; Express é o padrão de
fato para isso em Node, minimizando código de infraestrutura própria (roteador
manual, etc. — removido). Continua "backend mínimo": só autenticação do professor e
habilitação de alunos, nenhuma lógica de jogo no servidor (Princípio II).

**Alternativas consideradas**:
- Manter Cloudflare Workers + Render só para o estático — rejeitado pelo usuário:
  ele quer um monolito, não dois provedores para coordenar.
- VPS tradicional — mesmo problema de antes: manutenção de servidor/SO que um
  professor sem equipe de TI não deveria precisar fazer. Render Web Service dá
  runtime gerenciado sem esse custo operacional.
- **Limitação aceita conscientemente**: o tier gratuito do Render não tem disco
  persistente — o sistema de arquivos (e portanto o arquivo SQLite, ver decisão #2)
  reseta a cada deploy e a cada reinício por inatividade do container. O usuário
  escolheu essa opção explicitamente ("neste momento") sabendo que os dados de
  aluno/habilitação não sobrevivem a um redeploy. Ver decisão #8 para como a
  credencial do professor é protegida dessa limitação.

## 2. Banco de dados

**Decision** (revisado 2026-08-18): SQLite local via `better-sqlite3`, arquivo em
`backend/data/bitlab.db` (caminho configurável por `DB_PATH`), aberto pelo próprio
processo Node do monolito.

**Histórico**: a decisão original era Cloudflare D1 (SQLite gerenciado pela
Cloudflare). Trocado por SQLite "puro" porque o backend deixou de rodar em Workers —
`better-sqlite3` é a forma padrão, síncrona e sem dependência de rede de falar com
SQLite a partir de um processo Node.

**Rationale**: schema idêntico ao anterior (é SQL padrão, portável entre D1 e SQLite
"puro" — ambos são SQLite); `better-sqlite3` é síncrono (sem overhead de Promise para
cada query), amplamente usado e mantido, zero servidor de banco para provisionar.

**Alternativas consideradas**:
- Continuar em D1 mesmo com backend fora dos Workers — tecnicamente possível via API
  HTTP do D1, mas reintroduziria uma dependência de rede externa (Cloudflare) dentro
  de um monolito que já roda no Render; sem vantagem real sobre SQLite local.
- Postgres gerenciado — descartado pelos mesmos motivos da decisão original (poder
  desnecessário para 3 tabelas pequenas, mais uma conta/serviço externo).
- `node:sqlite` (módulo experimental nativo do Node) — descartado por depender de uma
  versão recente específica do Node ainda instável/experimental; `better-sqlite3` é
  mais maduro e amplamente compatível com o runtime que o Render oferece hoje.

## 3. Hash da senha do professor

**Decision**: PBKDF2 via Web Crypto API (`crypto.subtle`), nativa do runtime do
Workers.

**Rationale**: já disponível no runtime sem nenhuma dependência externa — mantém o
backend com zero dependências de terceiros, coerente com o racional de "menor desvio
possível" do Princípio II. PBKDF2 com salt aleatório por credencial e iteração alta
(≥100.000) é adequado para um único hash validado ocasionalmente (login do professor
não é uma rota de alto volume).

**Alternatives considered**:
- bcrypt via biblioteca npm — exigiria bundling de dependência externa no Worker;
  desnecessário quando a Web Crypto API nativa já resolve o requisito de "nunca texto
  claro" (FR-005).
- Argon2 via serviço externo — over-engineering para um único usuário administrador;
  adiciona uma dependência de rede à autenticação sem ganho relevante nesta escala.

## 4. Estratégia de sessão administrativa

**Decision**: token opaco aleatório (gerado com `crypto.randomUUID()` ou
equivalente), armazenado como `token_ativo` na linha do professor no SQLite. O
front-end (`admin.html`) guarda o token (ex.: em memória/`sessionStorage` do
navegador) e o envia como `Authorization: Bearer <token>` em cada chamada
administrativa. Sem data
de expiração embutida (FR-018): o token permanece válido até logout explícito (que
limpa `token_ativo` no banco) ou até redefinição manual da senha (que também limpa o
token, encerrando qualquer sessão antiga).

**Rationale**: atende FR-018 (sem expiração automática) e FR-019 (sem bloqueio por
tentativas) com o menor mecanismo possível — uma coluna no banco, sem necessidade de
tabela de sessões, JWT ou infraestrutura de revogação separada.

**Alternatives considered**:
- JWT assinado e stateless — rejeitado: sem estado no servidor não há como fazer
  logout revogar o token antes que ele "expire" (e FR-018 pede sessão sem expiração
  automática), o que tornaria logout ilusório sem uma lista de revogação adicional —
  complexidade maior para o mesmo resultado.
- Cookie de sessão com store dedicado (ex.: KV de sessões) — mais peças móveis do que
  necessário para um único administrador logando ocasionalmente.

**Nota (tier gratuito do Render, sem disco persistente)**: como o SQLite inteiro
reseta a cada deploy/reinício do container, `token_ativo` reseta junto — na prática
o professor precisa logar de novo depois de qualquer redeploy ou reinício por
inatividade, mesmo sem ter feito logout. Isso é uma consequência aceita da decisão
#1/#2, não um requisito novo.

## 5. Onde vive o painel administrativo

**Decision**: arquivo estático separado, `public/admin.html`, servido pelo mesmo
monolito Express que serve `public/index.html` e a API, vanilla JS, consumindo a
API via `fetch()` na mesma origem (sem `API_BASE` apontando para outro host).

**Rationale**: o `index.html` atual já tem ~2000 linhas; misturar a UI administrativa
no mesmo arquivo (atrás de uma rota/hash) aumentaria ainda mais um arquivo já grande
e misturaria dois públicos (aluno x professor) na mesma superfície de código. Um
segundo arquivo estático mantém a mesma filosofia de zero build/zero framework do
Princípio II, apenas separando responsabilidades.

**Alternatives considered**:
- Embutir o painel dentro do `index.html` atrás de `#/admin` — rejeitado: infla ainda
  mais o arquivo do jogo e mistura CSS/JS de duas experiências bem diferentes.
- SPA com framework dedicado para o admin — rejeitado: violaria o espírito de
  simplicidade do Princípio II sem necessidade real (o painel tem poucas telas:
  login, lista de alunos/turmas, ações de habilitar/revogar).

## 6. Suporte a duas trilhas no motor de jogo existente

**Decision**: introduzir um objeto `TRAILS` no `index.html`, indexado por id de
trilha (`'arquitetura'`, `'linguagens'`), cada entrada com seu próprio `stages`
(equivalente ao atual `STAGES`) e `ranks` (equivalente ao atual `RANKS`). O estado de
jogo `S` ganha um campo `trilhaId`; todo código hoje acoplado a `STAGES`/`RANKS`
globais passa a ler `TRAILS[S.trilhaId].stages` / `.ranks`. As funções de certificado
(`gerarCodigo`, `textoRelatorio`, `telaCertificacao`) e a amostragem de perguntas do
boss (`iniciarFase`) passam a operar sobre a trilha corrente, sem misturar as duas.

**Rationale**: preserva o padrão de gerador de pergunta já validado (função que
retorna `{tag, tipo, enun, dica, exp, ...}`), reaproveita toda a lógica de navegação
(`mostrar`, `renderTrilha`, `resolver`, `proxima`, `fimFase`) apenas trocando a fonte
de dados de `STAGES`/`RANKS` fixos para a trilha selecionada — menor refatoração
possível para atender FR-001/FR-002 sem duplicar o motor do jogo.

**Alternatives considered**:
- Duplicar o arquivo inteiro em um `index2.html` por trilha — rejeitado: duplica
  motor de jogo, navegação e estilo; qualquer correção de bug precisaria ser feita
  duas vezes, violando a meta de simplicidade de manutenção.
- Um único array `STAGES` fixo com um campo `trilha` por estação — rejeitado: quebra
  o acoplamento 1:1 hoje existente entre `STAGES` (8 estações não-boss) e `RANKS`
  (9 ranks), e complica a amostragem de perguntas do boss, que hoje pega perguntas de
  "todas as estações" — precisaria filtrar por trilha em todo lugar, mais propenso a
  erro do que isolar por trilha na estrutura de dados desde o início.

## 7. Validação do domínio de e-mail institucional

**Decision**: validar em duas camadas — no `index.html`, checagem simples de sufixo
(`@unidavi.edu.br`) no momento do cadastro, para feedback imediato ao aluno; e,
de forma autoritativa, o backend (`alunos.js`) repete a mesma validação antes de
gravar qualquer cadastro no SQLite, rejeitando qualquer chamada de API que tente
burlar a checagem do cliente.

**Rationale**: validação só no cliente é contornável (qualquer um pode chamar a API
diretamente); validação só no servidor perde a chance de dar feedback imediato ao
aluno no formulário. As duas camadas juntas atendem FR-016 sem introduzir biblioteca
de validação — é uma checagem de sufixo de string, trivial em ambos os lados.

**Alternatives considered**:
- Verificação de e-mail por link de confirmação — rejeitado: fora do escopo definido
  na clarificação da spec (a exigência foi "domínio aceito", não "posse comprovada do
  e-mail"); adicionaria complexidade de envio de e-mail não pedida.

## 8. Credencial do professor sobrevivendo a um disco efêmero (adicionado 2026-08-18)

**Decision**: no boot do `server.js`, depois de garantir o schema, se
`process.env.ADMIN_USUARIO` e `process.env.ADMIN_SENHA` estiverem definidos, o
servidor gera hash+salt e faz upsert da credencial do professor automaticamente —
todo boot, de forma idempotente.

**Rationale**: com o tier gratuito do Render (decisão #1), o SQLite inteiro — e
portanto a linha do professor — reseta a cada deploy/reinício. Sem esse
autoprovisionamento, o professor ficaria bloqueado fora da própria área
administrativa depois de qualquer redeploy, sem um shell disponível para rodar o
script de seed manualmente toda vez. Variáveis de ambiente configuradas no painel do
Render persistem entre deploys mesmo sem disco persistente — usá-las como fonte da
credencial resolve exatamente essa lacuna, sem contradizer FR-017 (a credencial
continua provisionada "fora da interface do jogo", só que por variável de ambiente
em vez de comando manual).

**Alternatives considered**:
- Rodar `node scripts/seed-professor.js` manualmente via shell do Render depois de
  cada deploy — tecnicamente possível, mas é um passo manual fácil de esquecer, e
  bloqueia o professor até alguém lembrar de rodá-lo. O script continua existindo
  para uso local/desenvolvimento, mas não é mais o caminho principal em produção.
  Ver quickstart.md para instruções completas de configuração das variáveis de
  ambiente no Render.
- Adicionar um Persistent Disk do Render — resolveria de vez, mas exige plano pago;
  o usuário optou por não fazer isso agora. Fica registrado como próximo passo óbvio
  se/quando o projeto migrar para um plano pago (nesse caso, `DB_PATH` já é
  configurável por variável de ambiente, então só aponta para o caminho montado do
  disco e o autoprovisionamento por env var deixa de ser estritamente necessário,
  mas pode continuar como reforço).
