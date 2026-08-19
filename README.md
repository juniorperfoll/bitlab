# BIT LAB — Trilhas de Arquitetura de Computadores e Linguagens de Programação

Jogo sério (serious game) educacional com duas trilhas, criado como material didático
de apoio ao Bacharelado em Sistemas de Informação da **UNIDAVI**:

- **Arquitetura de Computadores** — sistemas de numeração, conversões entre bases,
  frações binárias, números negativos, ponto flutuante (IEEE 754) e codificação de
  caracteres (ASCII/UTF-8). Cobre o conteúdo das **Aulas 02 e 03**.
- **Linguagens de Programação e Paradigmas** — fundamentos de linguagens, paradigmas
  imperativo/declarativo, estruturado, orientado a objetos, funcional, lógico,
  sistemas de tipos e comparação de sintaxe entre linguagens.

Autor: Prof. Esp. Ademar Perfoll Junior.

Turmas atendidas: **T33F2** (quintas-feiras) e **T34F2** (sextas-feiras).

## Objetivo de negócio

Fixação de conteúdo pós-aula via prática gamificada, e **comprovação de presença/participação**: ao concluir a trilha o aluno recebe um código de certificação e um relatório de desempenho para copiar e enviar ao professor pelo **Google Classroom**.

## Como funciona

1. Aluno informa nome, idade, matrícula, turma e e-mail institucional (domínio
   `@unidavi.edu.br`, obrigatório) — usados para gerar perguntas personalizadas (ex.:
   converter a própria idade para binário, montar o próprio nome em ASCII) e para o
   professor controlar o acesso.
2. Escolhe uma das duas trilhas disponíveis. Cada trilha só é jogável se o professor
   já tiver habilitado aquele aluno (individualmente ou pela turma inteira) para ela
   — ver "Área administrativa" abaixo.
3. Progride por uma **trilha evolutiva de 8 estações** (dificuldade crescente) + 1
   estação **boss** de certificação final. Estações da trilha de Arquitetura de
   Computadores:
   1. Fundamentos (bit, byte, 2ⁿ)
   2. Sistemas de Numeração
   3. Decimal ⇄ Outras Bases
   4. Agrupamento de Bits
   5. Números Fracionários
   6. Números Negativos
   7. Ponto Flutuante
   8. Codificação de Caracteres
   - ★ Certificação Final — 12 perguntas sorteadas de todas as estações, pontuação dobrada
4. Cada estação tem um banco (pool) de geradores de pergunta com valores aleatorizados — repetir a trilha não repete as mesmas perguntas.
5. Erros não travam o progresso: a explicação do cálculo aparece na hora, reforçando o aprendizado.
6. Pontuação (XP), taxa de acerto e nível de rank evoluem de **Recruta dos Bits** até **Mestre da Representação de Dados** (rank por trilha).
7. Painel de registrador de 8 bits (LEDs BIN/HEX/OCT/DEC) reforça visualmente cada conversão.
8. Gaveta de tabelas de apoio (nibble, ASCII imprimível, referência de negativos/IEEE 754) disponível a qualquer momento.

## Área administrativa

`admin.html` é o painel do professor: login com usuário/senha, lista de alunos
cadastrados e ações para habilitar ou revogar o acesso de uma turma inteira ou de um
aluno individual a cada trilha. Detalhes técnicos em
[`specs/001-duas-trilhas-admin-professor/`](specs/001-duas-trilhas-admin-professor/)
(spec, plano, contrato de API e guia de validação).

## Estado atual

`index.html` e `admin.html` continuam páginas estáticas em HTML/CSS/JS puro, sem
build. A única parte com backend é um serviço mínimo (`backend/`, Cloudflare Workers
+ banco D1) exclusivamente para autenticação do professor e habilitação de alunos —
escopo autorizado pelo Princípio II (v2.0.0) da
[constituição do projeto](.specify/memory/constitution.md). Nenhum outro dado de
jogo é persistido: respostas e progresso dentro de uma trilha em andamento continuam
vivendo só em memória do navegador.

Referência bibliográfica usada no conteúdo de Arquitetura de Computadores:
STALLINGS, W. *Arquitetura e organização de computadores*. 10. ed. São Paulo:
Pearson, 2017. Cap. 9 e 10.
