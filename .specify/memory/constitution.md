<!--
Sync Impact Report
==================
Version change: N/A (template) → 1.0.0
Modified principles: N/A (initial ratification, all placeholders resolved)
Added sections:
  - Core Principles: I. Português Brasileiro Obrigatório (NON-NEGOTIABLE),
    II. Arquivo Único e Zero Dependências, III. Rigor Pedagógico e Fidelidade de
    Conteúdo, IV. Aprendizagem sem Bloqueio, V. Personalização e Variabilidade
  - Restrições Técnicas e Privacidade
  - Fluxo de Validação em Sala de Aula
  - Governance
Removed sections: none (first concrete ratification of the scaffold)
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending manual review (not modified by this command)
  - .specify/templates/spec-template.md ⚠ pending manual review (not modified by this command)
  - .specify/templates/tasks-template.md ⚠ pending manual review (not modified by this command)
Follow-up TODOs: none
-->

# BIT LAB — Trilha de Arquitetura de Computadores Constitution

## Core Principles

### I. Português Brasileiro Obrigatório (NON-NEGOTIABLE)

Todo texto exibido no jogo (perguntas, feedbacks, rótulos de interface, mensagens de
erro, certificado, relatório de desempenho) e toda a documentação do projeto (README,
comentários de arquitetura, specs, planos, tasks) DEVEM ser escritos em português
brasileiro. Termos técnicos consagrados em inglês (bit, byte, overflow, IEEE 754,
ASCII, UTF-8) são permitidos sem tradução por serem nomenclatura padrão da área.
Nenhuma string de interface ou conteúdo pedagógico pode ser adicionada em outro
idioma sem tradução equivalente em pt-BR.

**Racional**: o projeto é material didático para turmas de Sistemas de Informação da
UNIDAVI ministradas em português; qualquer conteúdo em outro idioma quebra a
acessibilidade pedagógica do público-alvo.

### II. Arquivo Único e Zero Dependências

O jogo é entregue como página única (`index.html`) com HTML, CSS e JS embutidos no
mesmo arquivo. É PROIBIDO introduzir passo de build, bundler, gerenciador de pacotes,
framework externo ou backend/servidor. O jogo DEVE continuar funcionando ao abrir o
arquivo diretamente no navegador, sem etapa de instalação.

**Racional**: simplicidade de distribuição é requisito de negócio — o professor
compartilha o arquivo diretamente com as turmas (Google Classroom), sem infraestrutura
de hospedagem ou processo de deploy.

### III. Rigor Pedagógico e Fidelidade de Conteúdo

Todo gerador de pergunta, cálculo, conversão de base, explicação de erro e tabela de
apoio DEVE estar tecnicamente correto e alinhado à referência bibliográfica adotada
(STALLINGS, W. *Arquitetura e organização de computadores*. 10. ed. Pearson, 2017,
cap. 9 e 10) e ao conteúdo das Aulas 02 e 03. Qualquer nova estação, pergunta ou
explicação DEVE ser validada manualmente (cálculo conferido à mão ou por script) antes
de entrar em uso com as turmas.

**Racional**: o jogo substitui parte da fixação de conteúdo pós-aula; um erro de
cálculo no próprio material de estudo prejudica diretamente o aprendizado do aluno.

### IV. Aprendizagem sem Bloqueio (Erro é Feedback)

Um erro do aluno NUNCA pode travar ou impedir o progresso na trilha. Toda resposta
incorreta DEVE exibir imediatamente a explicação do cálculo correto antes de permitir
seguir adiante. É proibido implementar mecanismos de "tentativas limitadas" ou
travas de bloqueio permanente por erro.

**Racional**: o objetivo é fixação de conteúdo, não eliminação — o aluno erra,
entende o porquê, e continua, mantendo o engajamento com o jogo sério.

### V. Personalização e Variabilidade das Perguntas

Dados informados pelo aluno (nome, idade, matrícula, turma) DEVEM ser usados para
personalizar perguntas sempre que a estação permitir (ex.: converter a própria idade,
montar o próprio nome em ASCII). Cada estação DEVE manter um banco (pool) de
geradores de pergunta com valores aleatorizados, de modo que repetir a trilha não
repita as mesmas perguntas na mesma ordem ou com os mesmos valores.

**Racional**: personalização aumenta engajamento e dificulta cola entre colegas;
variabilidade permite reuso da trilha para reforço sem memorização de respostas.

## Restrições Técnicas e Privacidade

- Sem persistência entre sessões e sem backend: os dados do aluno (nome, idade,
  matrícula, turma) existem apenas em memória/local da sessão do navegador enquanto
  o jogo estiver aberto; não podem ser enviados a servidores externos nem gravados em
  armazenamento persistente (localStorage, cookies, banco de dados) sem necessidade
  pedagógica explícita e documentada.
- O código-fonte permanece HTML/CSS/JS puro (vanilla), sem frameworks front-end, sem
  dependências via CDN e sem etapa de transpilação/build.
- O único artefato de saída ao final da trilha é o código de certificação e o
  relatório de desempenho em texto, feitos para o aluno copiar e colar manualmente no
  Google Classroom.

## Fluxo de Validação em Sala de Aula

- Qualquer mudança em `index.html` (nova estação, novo gerador de pergunta, ajuste de
  pontuação/rank) DEVE ser testada manualmente no navegador, cobrindo o caminho feliz
  e casos de erro, antes de ser usada com as turmas **T33F2** ou **T34F2**.
- Mudanças que alterem o conteúdo pedagógico (fórmulas, explicações, tabelas de
  apoio) DEVEM ser revisadas pelo autor/professor responsável (Prof. Esp. Ademar
  Perfoll Junior) antes de entrarem em uso, dado que o material é usado como prova de
  participação/presença.
- Alterações de idioma, texto ou copy DEVEM ser conferidas quanto à conformidade com
  o Princípio I (Português Brasileiro Obrigatório) antes do merge.

## Governance

Esta constituição prevalece sobre qualquer outra prática ou convenção informal do
projeto. Toda alteração de código ou documentação que a contrarie deve ser corrigida
ou a constituição deve ser formalmente emendada.

**Procedimento de emenda**: propor a mudança descrevendo o princípio ou seção afetada
e a justificativa; atualizar este arquivo com o novo texto; registrar a mudança no
Sync Impact Report no topo do arquivo; atualizar a versão conforme a política abaixo.

**Política de versionamento** (versionamento semântico aplicado à governança):
- MAJOR: remoção ou redefinição incompatível de um princípio existente.
- MINOR: adição de novo princípio ou seção, ou expansão material de uma regra
  existente.
- PATCH: correções de redação, esclarecimentos ou ajustes não semânticos.

**Revisão de conformidade**: antes de considerar qualquer feature, spec, plano ou
conjunto de tasks como concluído, verificar aderência aos cinco Princípios Centrais
acima, em especial o Princípio I (idioma) e o Princípio II (arquivo único, zero
dependências).

**Version**: 1.0.0 | **Ratified**: 2026-08-18 | **Last Amended**: 2026-08-18
