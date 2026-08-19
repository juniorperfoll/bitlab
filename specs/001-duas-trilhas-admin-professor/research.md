# Research: Duas Trilhas e Área Administrativa do Professor

## 1. Runtime e hospedagem do backend mínimo

**Decision**: Cloudflare Workers.

**Rationale**: serverless de verdade (sem servidor para o professor manter/atualizar),
tier gratuito generoso e suficiente para a escala do projeto (2 turmas, dezenas de
alunos), deploy com um único comando (`wrangler deploy`), e roda JavaScript vanilla —
sem exigir framework de servidor, alinhado ao espírito de simplicidade do Princípio
II mesmo fora do escopo estrito do front-end.

**Alternatives considered**:
- VPS tradicional (ex.: EC2/DigitalOcean) — rejeitado: exige manutenção de servidor,
  patches de sistema operacional, e custo fixo mensal; incompatível com "backend
  mínimo" e com a realidade de um professor sem equipe de TI.
- Vercel/Netlify Functions — viável tecnicamente, mas o projeto já não tem nenhuma
  dependência de ecossistema Node/npm; Workers evita introduzir esse ecossistema para
  o front-end também.
- BaaS gerenciado (Firebase/Supabase) com SDK embarcado no `admin.html`/`index.html`
  — já descartado na fase de especificação: o usuário escolheu explicitamente
  "backend leve + banco de dados" (API própria) em vez de um SDK de terceiros
  embarcado no cliente, para manter controle total sobre a lógica de autenticação e
  evitar uma nova dependência de front-end.

## 2. Banco de dados

**Decision**: Cloudflare D1 (SQLite serverless, integrado ao Workers).

**Rationale**: schema relacional simples (3 tabelas) cabe perfeitamente em SQLite;
zero custo de operação, zero servidor de banco para provisionar; acesso direto via
binding no Worker, sem driver de rede adicional.

**Alternatives considered**:
- Postgres gerenciado (Neon/Supabase DB) — mais poder do que o necessário para 3
  tabelas pequenas; adiciona uma conta/serviço externo extra sem benefício real nesta
  escala.
- Cloudflare KV (chave-valor) — insuficiente: habilitações exigem consultas
  relacionais simples (aluno × trilha, turma × trilha) que um key-value puro tornaria
  mais complicadas de manter consistentes do que um schema SQL básico.
- Arquivo JSON versionado no repositório, editado manualmente pelo professor — foi a
  opção "tudo estático" já rejeitada na clarificação da spec (não sincroniza entre
  dispositivos em tempo real, exige reimplantação manual a cada habilitação).

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
equivalente), armazenado como `token_ativo` na linha do professor no D1. O front-end
(`admin.html`) guarda o token (ex.: em memória/`sessionStorage` do navegador) e o
envia como `Authorization: Bearer <token>` em cada chamada administrativa. Sem data
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

## 5. Onde vive o painel administrativo

**Decision**: arquivo estático separado, `admin.html`, na raiz do repositório, vanilla
JS, consumindo a API do backend via `fetch()`.

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
gravar qualquer cadastro no D1, rejeitando qualquer chamada de API que tente burlar a
checagem do cliente.

**Rationale**: validação só no cliente é contornável (qualquer um pode chamar a API
diretamente); validação só no servidor perde a chance de dar feedback imediato ao
aluno no formulário. As duas camadas juntas atendem FR-016 sem introduzir biblioteca
de validação — é uma checagem de sufixo de string, trivial em ambos os lados.

**Alternatives considered**:
- Verificação de e-mail por link de confirmação — rejeitado: fora do escopo definido
  na clarificação da spec (a exigência foi "domínio aceito", não "posse comprovada do
  e-mail"); adicionaria complexidade de envio de e-mail não pedida.
