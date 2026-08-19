# Feature Specification: Trilha LPP — Fundamentos, Paradigmas e Big-O (Aulas 01–03)

**Feature Branch**: `003-trilha-lpp-fundamentos`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: rascunho de especificação completo fornecido pelo
professor, extraindo o conteúdo das Aulas 01, 02 e 03 de Linguagem de Programação e
Paradigmas (LPP), BSN — UNIDAVI, para revisão pós-aula via trilha gamificada,
seguindo o padrão já implementado no BIT LAB.

## Clarifications

### Session 2026-08-19

- Q: O BitLab já tem uma trilha "Linguagens de Programação e Paradigmas" (8
  estações, conteúdo genérico, feature 001). Esta trilha nova (12 estações, fiel ao
  syllabus real das Aulas 01-03) substitui o conteúdo dessa trilha existente, ou é
  uma trilha adicional e distinta? → A: Substitui — mesmo slot/id na tela de
  seleção, as 8 estações genéricas dão lugar às 12 novas. Não haverá duas trilhas de
  LPP concorrentes; o jogo continua com duas trilhas no total (Arquitetura de
  Computadores + LPP — Fundamentos e Paradigmas).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Revisão completa pós-aula (Priority: P1)

Como aluno de LPP que já assistiu às Aulas 01, 02 e 03, quero revisar os conteúdos
de forma gamificada e progressiva, para fixar os conceitos de paradigmas, análise de
algoritmos (Big-O) e sintaxe/semântica antes das avaliações teóricas.

**Why this priority**: é o objetivo central da feature — sem isso não há trilha
jogável.

**Independent Test**: pode ser testado isoladamente iniciando a trilha e completando
pelo menos uma estação, com um aluno já habilitado para ela.

**Acceptance Scenarios**:

1. **Given** um aluno habilitado para a trilha "LPP — Fundamentos e Paradigmas",
   **When** ele a seleciona na tela inicial, **Then** o jogo exibe a primeira
   estação não concluída (ou a Estação 1, se for a primeira vez).
2. **Given** um aluno respondendo uma pergunta da estação, **When** ele erra,
   **Then** o sistema exibe a explicação do raciocínio correto e permite avançar (o
   erro não bloqueia o progresso).
3. **Given** um aluno que concluiu as 12 estações, **When** ele acessa a trilha
   novamente, **Then** o sistema libera a estação boss de Certificação Final.
4. **Given** um aluno na estação boss, **When** ele a conclui, **Then** o sistema
   gera um código de certificação e um relatório de desempenho copiável para envio
   ao Google Classroom (mesmo padrão do BIT LAB).

---

### User Story 2 - Revisão de um bloco específico (Priority: P1)

Como aluno que sente mais dificuldade especificamente em notação Big-O, quero
identificar visualmente e revisitar só as estações do bloco de análise de
algoritmos, para focar meu tempo de estudo onde mais preciso.

**Why this priority**: Big-O é o conteúdo com maior densidade de material de apoio
já produzido pelo professor e o de maior risco de abstração excessiva — vale a pena
facilitar o acesso direto ao bloco.

**Independent Test**: pode ser testado isoladamente completando o bloco "Aula 01" e
verificando que dá para voltar e refazer qualquer estação do bloco "Aula 02" sem
precisar reiniciar a trilha inteira.

**Acceptance Scenarios**:

1. **Given** um aluno dentro da trilha, **When** ele visualiza o mapa de estações,
   **Then** consegue identificar visualmente quais estações pertencem a cada bloco
   temático ("Aula 01", "Aula 02 — Big-O", "Aula 03").
2. **Given** um aluno que já concluiu uma estação (de qualquer bloco), **When** ele
   volta ao mapa da trilha, **Then** consegue reabrir e refazer especificamente
   aquela estação (mesmo mecanismo de "Refazer com outros valores" já existente nas
   trilhas atuais), sem depender de refazer as estações entre ela e a atual.

---

### User Story 3 - Perguntas de Big-O por reconhecimento de padrão (Priority: P2)

Como aluno de SI com pouca base matemática, quero que as perguntas de Big-O sejam
baseadas em reconhecimento de padrão em código Python real (não em prova algébrica),
para conseguir responder com confiança.

**Why this priority**: é um requisito pedagógico transversal (não uma tela nova),
mas condiciona fortemente o formato dos geradores de pergunta — por isso é uma
história separada e testável (revisão de conteúdo pelo professor antes do
lançamento).

**Acceptance Scenarios**:

1. **Given** uma pergunta gerada na estação de Classes de Complexidade, **When** o
   aluno a visualiza, **Then** o enunciado apresenta um trecho de código Python
   curto (não uma expressão algébrica pura) para classificar.
2. **Given** uma pergunta gerada na estação de Regras de Simplificação, **When** o
   aluno erra, **Then** a explicação usa a tabela de razão numérica (não
   substituição algébrica) para justificar a resposta.

---

### Edge Cases

- O que acontece se o professor habilitar a trilha para o aluno no meio de uma
  sessão em andamento (aluno já na tela de seleção)? A trilha deve aparecer
  disponível na próxima verificação de habilitação feita pelo jogo (ex.: ao tentar
  selecioná-la de novo), sem exigir logout.
- O que acontece se o aluno abandonar a trilha no meio de uma estação e voltar
  depois? Mesmo comportamento já existente nas trilhas atuais: o progresso dentro de
  uma estação em andamento vive só em memória do navegador; ao voltar (nova sessão
  do navegador), a trilha reinicia do zero — nenhuma marcação de "estação concluída"
  é persistida no backend (ver Assumptions).
- O que acontece se um gerador de pergunta não tiver variação suficiente e repetir
  uma pergunta idêntica na mesma sessão? Fora de escopo desta especificação definir
  o algoritmo exato de sorteio; o requisito cobre apenas a exigência de que exista
  pool suficiente por estação (FR-010).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST substituir o conteúdo da trilha "Linguagens de
  Programação e Paradigmas" já existente pela nova estrutura descrita nesta
  especificação — mesma trilha/slot na tela de seleção, conteúdo pedagógico
  totalmente novo (12 estações fiéis ao syllabus real, no lugar das 8 estações
  genéricas da feature 001).
- **FR-002**: O sistema MUST organizar a trilha em 12 estações fixas, agrupadas em 3
  blocos temáticos correspondentes às Aulas 01, 02 e 03 (ver Apêndice A — Conteúdo
  por Estação).
- **FR-003**: O sistema MUST exigir habilitação prévia do professor (individual ou
  por turma) antes de liberar a trilha para o aluno, reaproveitando o mecanismo de
  habilitação por trilha já existente no painel administrativo.
- **FR-004**: O sistema MUST sortear perguntas de um pool de geradores por estação,
  com valores/exemplos aleatorizados, de forma que repetir a trilha não repita as
  mesmas perguntas literais.
- **FR-005**: O sistema MUST exibir a explicação do raciocínio correto imediatamente
  após uma resposta errada, sem bloquear o progresso do aluno.
- **FR-006**: O sistema MUST liberar a estação boss de Certificação Final somente
  após a conclusão das 12 estações regulares.
- **FR-007**: A estação boss MUST sortear 12 perguntas entre todas as estações da
  trilha, com pontuação em dobro.
- **FR-008**: Ao concluir a estação boss, o sistema MUST gerar um código de
  certificação e um relatório de desempenho no mesmo formato usado pelas trilhas já
  existentes (texto copiável para o Google Classroom).
- **FR-009**: O sistema MUST evoluir XP, taxa de acerto e rank do aluno de forma
  independente por trilha, seguindo o padrão já usado (rank por trilha, não único).
- **FR-010**: Cada estação MUST ter um pool de geradores de pergunta suficiente para
  não repetir a mesma pergunta em execuções consecutivas da trilha pelo mesmo aluno
  (mínimo sugerido: 3 variações por gerador).
- **FR-011**: As perguntas sobre notação Big-O (bloco "Aula 02") MUST priorizar
  reconhecimento de padrão em código Python e tabelas de razão numérica, e NÃO
  DEVEM exigir prova algébrica ou dedução matemática formal do aluno.
- **FR-012**: As perguntas sobre gramáticas e derivações (bloco "Aula 03", estações
  finais) NÃO DEVEM exigir a construção de autômatos finitos com rigor formal
  (DFSA) — tratamento apenas conceitual/visual, se incluído.
- **FR-013**: Onde aplicável, o sistema MUST ancorar exemplos no domínio único do
  curso ("Sistema de Gestão de Pedidos"), especialmente nas estações de Fundamentos
  da Análise, Classes de Complexidade, Regras de Simplificação e Trade-off
  Espaço-Tempo.
- **FR-014**: O sistema MAY personalizar exemplos usando dados do próprio aluno
  (nome, idade), reaproveitando o padrão já usado nas trilhas existentes (ex.:
  gerar um trecho de código com o nome do aluno na estação de lexema/token).
- **FR-015**: O sistema MUST identificar visualmente, no mapa da trilha, a qual
  bloco temático cada estação pertence (ver User Story 2). A ordem de desbloqueio
  das estações continua sequencial (uma por vez, mesmo padrão das trilhas
  existentes) — "revisar um bloco" significa reabrir/refazer uma estação já
  concluída daquele bloco, não pular estações ainda não alcançadas.

### Key Entities

- **Trilha**: conjunto nomeado de estações + boss (aqui, a trilha existente
  "Linguagens de Programação e Paradigmas" com conteúdo substituído). Atributos: id,
  nome, blocos, estações, status de habilitação por aluno/turma.
- **Bloco**: agrupamento temático de estações dentro da trilha ("Aula 01", "Aula
  02", "Aula 03"). Usado apenas para identificação visual/navegação — não é uma
  entidade de progresso separada nem persistida.
- **Estação**: unidade de progresso da trilha. Atributos: id, ordem, bloco, título,
  pool de geradores de pergunta, dificuldade.
- **Gerador de Pergunta**: template parametrizável associado a uma estação, capaz de
  produzir múltiplas variações de uma mesma pergunta (ver Apêndice B).
- **Estação Boss**: estação especial de certificação final; sorteia perguntas do
  pool agregado de todas as estações regulares da trilha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos alunos habilitados conseguem selecionar a trilha e ver a
  primeira estação disponível, sem erro de carregamento.
- **SC-002**: 0% das respostas erradas travam o progresso do aluno — toda resposta
  errada é seguida de explicação e liberação para avançar.
- **SC-003**: Repetir a trilha inteira não repete a mesma pergunta literal em pelo
  menos 90% das tentativas (dado o mínimo de 3 variações por gerador, FR-010).
- **SC-004**: 100% das perguntas do bloco "Aula 02 — Big-O" usam código Python ou
  tabela de razão numérica como base, nunca prova algébrica formal — verificável por
  revisão pedagógica do professor antes do lançamento (FR-011).
- **SC-005**: A taxa de conclusão da trilha "LPP — Fundamentos e Paradigmas" fica
  dentro de 10 pontos percentuais da taxa de conclusão da trilha "Arquitetura de
  Computadores", indicando paridade de experiência entre trilhas (mesmo critério já
  usado na feature 001).
- **SC-006**: 100% dos alunos que concluem a estação boss recebem código de
  certificação e relatório copiável, no mesmo formato das demais trilhas.

## Assumptions

- **Substituição, não trilha nova**: conforme resolvido na sessão de esclarecimento,
  esta especificação substitui o conteúdo da trilha "Linguagens de Programação e
  Paradigmas" (8 estações genéricas, feature 001) pelas 12 estações fiéis ao
  syllabus real das Aulas 01-03. Os 40 geradores de pergunta escritos na feature 001
  para essa trilha deixam de ser usados (removidos ou substituídos na
  implementação) — detalhamento exato fica a cargo do plano técnico, não desta
  especificação.
- **Sem persistência de progresso por estação**: mantendo o Princípio II da
  constituição do projeto e o comportamento já existente nas trilhas atuais, o
  progresso dentro de uma trilha em andamento (quais estações já foram concluídas
  nesta sessão) continua vivendo só em memória do navegador — reiniciar o navegador
  reinicia a trilha do zero. Nenhuma nova persistência de progresso por estação é
  introduzida por esta feature.
- **Blocos são só agrupamento visual**: "bloco" (Aula 01/02/03) é uma categoria de
  exibição no mapa da trilha, não uma trava de navegação nova — a trilha continua
  desbloqueando uma estação por vez, na ordem; revisar um bloco já concluído usa o
  mecanismo de "refazer estação" que já existe hoje.
- **Validação de conteúdo pedagógico é pré-requisito de lançamento**: conforme
  Princípio III (Rigor Pedagógico) da constituição, todo o conteúdo desta trilha —
  em especial as restrições de FR-011 (Big-O sem álgebra formal) e FR-012 (sem
  autômatos formais) — MUST ser validado pelo professor responsável contra o
  material-fonte (slides das aulas, material de apoio) antes de entrar em uso com as
  turmas, seguindo o "Fluxo de Validação em Sala de Aula" já estabelecido.
- **Hospedagem inalterada**: a trilha roda nas mesmas condições de hospedagem atuais
  (Render Web Service, tier gratuito), sem introduzir novas dependências de
  infraestrutura — reaproveita o backend mínimo já existente (autenticação e
  habilitação), sem armazenar nenhum dado novo além do já autorizado pela
  constituição.
- **Fora de escopo explicitamente**: autômatos de estado finito (DFSA) com rigor
  formal (só menção a ferramenta de apoio visual, se incluído); provas de corretude
  de programa, semânticas axiomáticas, tripla de Hoare; conteúdo de Prolog,
  concorrência, Design Patterns/PHP — todos pertencem a trilhas ou material futuro,
  fora desta especificação.

## Apêndice A — Conteúdo por Estação (referência pedagógica, não técnica)

### Bloco 1 — Aula 01: Fundamentos e Paradigmas

**Estação 1 — Aspectos Históricos e os 4 Paradigmas da Disciplina**
- A disciplina aprofunda 4 dos paradigmas históricos: Lógico (Prolog), Funcional
  (Lambda/Lisp), Orientado a Eventos (GUIs/event loops) e Orientado a Objetos
  (Python). Imperativo/Estruturado/Procedural ficam implícitos na sintaxe Python
  usada o semestre inteiro.
- Programação imperativa é o paradigma mais antigo, fundamentado no modelo von
  Neumann-Eckert (programa e variáveis armazenados juntos).

**Estação 2 — Domínios de Programação e Categorias de Linguagens**
- Domínios de aplicação (científico, sistemas de informação/negócios, IA,
  embarcados/tempo real, web/scripting) e categorias de linguagens (compiladas x
  interpretadas, tipagem estática x dinâmica).

**Estação 3 — Critérios de Avaliação e Trade-offs de Projeto**
- Critérios: legibilidade, escribilidade, confiabilidade, custo.
- Trade-offs conflitantes: facilidade de uso vs. eficiência; expressividade vs.
  simplicidade; segurança vs. liberdade; compatibilidade vs. inovação;
  portabilidade vs. desempenho.
- Exemplo âncora: Java verifica limites de vetores em tempo de execução (mais
  confiável, mais custoso); C não verifica (mais rápido, menos seguro). Java trocou
  eficiência por confiabilidade.

**Estação 4 — Influências no Projeto: Arquitetura de von Neumann**
- Modelo von Neumann-Eckert: Controle, Aritmética/Lógica, Memória, Entrada, Saída,
  Variáveis, Programa — base do paradigma imperativo.

### Bloco 2 — Aula 02: Análise de Algoritmos e Notação Big-O

**Estação 5 — Fundamentos da Análise de Algoritmos**
- Complexidade de tempo (passos) x complexidade de espaço (memória), em função do
  tamanho da entrada n. Pior caso, melhor caso, caso médio.

**Estação 6 — Fundamentos e Origem da Notação Big-O**
- Big-O mede crescimento de passos conforme n cresce, não tempo em segundos.
  Independe da máquina; foca no pior caso.
- Linha do tempo: Bachmann (1894) → Landau (1909, "notação de Landau") → Knuth
  (1976, adapta para algoritmos). "O" vem de "Ordnung" (ordem).
- Analogia-âncora: dicionário de papel — estratégia ingênua (virar página por
  página) = O(n); estratégia esperta (busca binária) = O(log n).

**Estação 7 — As Classes de Complexidade**
- O(1) constante; O(log n) logarítmica; O(n) linear; O(n²) quadrática; O(2ⁿ)
  exponencial — cada uma com exemplo de código Python de reconhecimento direto (ver
  Apêndice B, Gerador G7).
- Regra prática: 0 laços sobre n → O(1); 1 laço → O(n); 2 laços aninhados → O(n²).
  Atenção: laços sequenciais (não aninhados) continuam O(n) — pegadinha pedagógica
  relevante.

**Estação 8 — As 3 Regras de Simplificação**
1. Conte as operações (escreva f(n) como soma).
2. Jogue fora as constantes (2n, 100n, n+2 → todas O(n)).
3. Fique com o termo dominante (analogia do app carregando: 10.000ms + 300ms + 5ms ≈
   "uns 10 segundos").
- Tabela de razão n² ÷ (3n+5) para n = 10, 100, 1.000, 10.000 — abordagem
  pedagógica validada, usar em vez de álgebra abstrata.

**Estação 9 — Comparando Algoritmos e Trade-off Espaço-Tempo**
- Espaço (memória: RAM, disco, estruturas auxiliares) x Tempo (passos).
- Exemplo: guardar lista auxiliar para acelerar busca custa memória extra.
- Ferramenta de apoio (fora do jogo): Big-O Visualiser. Tabela de referência
  n=10/100/1.000 para O(1), O(log n), O(n), O(n²).
- Ancorar em "Sistema de Gestão de Pedidos": buscar pedido em lista não ordenada
  (O(n)) vs. índice/hash (O(1), mais memória).

### Bloco 3 — Aula 03: Sintaxe e Semântica

**Estação 10 — Sintaxe vs. Semântica: Lexema, Token e Linguagem**
- Sintaxe = forma/estrutura; Semântica = significado.
- Sentença = sequência de caracteres; Linguagem = conjunto de sentenças; Lexema =
  menor unidade sintática (`*`, `sum`, `begin`); Token = categoria de lexemas
  (identificador, número, etc.).

**Estação 11 — Gramáticas BNF e Hierarquia de Chomsky**
- Gramática livre de contexto: produções P, terminais T, não-terminais N, símbolo
  inicial S. Produção: `A → α`.
- BNF é tratada como sinônimo de gramática livre de contexto no curso.
- Hierarquia de Chomsky (simples → complexa): regular → livre de contexto →
  sensível ao contexto → irrestrita. Só as duas primeiras interessam a linguagens de
  programação.
- Exemplo âncora: `Inteiro → Dígito | Inteiro Dígito` / `Dígito → 0|...|9`.

**Estação 12 — Derivações e Árvores de Análise (Parse Trees)**
- Derivação mais à esquerda vs. mais à direita — ambas geram a mesma árvore de
  análise (ponto de confusão comum a explorar em V/F).
- Árvore de análise: raiz = símbolo inicial; folhas = terminais; ler folhas da
  esquerda para a direita reconstrói a string original.

### ★ Estação Boss — Certificação Final (Aulas 01–03)
- 12 perguntas sorteadas entre as 12 estações acima, pontuação dobrada.

## Apêndice B — Exemplos de Geradores de Pergunta (referência de conteúdo)

> Estes exemplos ilustram o conteúdo e o padrão de parametrização esperado; o
> formato técnico exato (schema/estrutura de dados) de um gerador fica a cargo do
> plano técnico (`plan.md`), não desta especificação.

- **Gerador G7 (Estação 7 — Classes de Complexidade)**: apresenta um trecho de
  código Python entre 4 variações fixas e pede a classificação correta:
  ```python
  # A) → O(n)
  for x in lista:
      print(x)

  # B) → O(1)
  print(lista[0])

  # C) → O(n²)
  for x in lista:
      for y in lista:
          print(x, y)

  # D) → O(n)  (laços sequenciais, não aninhados — distrator)
  for x in lista:
      print(x)
  for y in lista:
      print(y)
  ```
- **Gerador G8 (Estação 8 — Tabela de Razão)**: parametriza os coeficientes de uma
  expressão do tipo `n² + an + b` e pede ao aluno para identificar o termo dominante
  usando a tabela de razão (variar `a` e `b` a cada sorteio, ex.: `n² + 3n + 5`,
  `n² + 10n + 2`, `n² + n + 50`).
- **Gerador G6 (Estação 6 — Analogia do dicionário)**: varia o "objeto" buscado
  (dicionário, lista telefônica, catálogo de produtos do Sistema de Gestão de
  Pedidos) mantendo a mesma estrutura de pergunta (qual estratégia é O(n) e qual é
  O(log n)).
- **Gerador G3 (Estação 3 — Trade-offs)**: varia a linguagem citada (Java/C/outra) e
  o aspecto (checagem de limites de array, tipagem estática/dinâmica) mantendo a
  mesma estrutura de pergunta binária (confiabilidade vs. eficiência).
- **Gerador G10 (Estação 10 — Lexema/Token personalizado)**: monta uma atribuição
  simples usando o nome do aluno (ex.: `<nome> = 10`) e pede para contar/classificar
  os lexemas — reaproveita o padrão de personalização já usado no BIT LAB.
