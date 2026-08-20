<!--
Sync Impact Report
==================
Version change: 2.1.0 → 3.0.0
Modified principles:
  - IV. Aprendizagem sem Bloqueio (Erro é Feedback) → IV. Validação por Acerto com
    Retentativa Sempre Disponível (REDEFINIÇÃO INCOMPATÍVEL — reverte a garantia
    anterior de que "erro NUNCA pode travar ou impedir o progresso na trilha".
    Agora uma estação/objeto interativo só é considerado validado quando respondido
    CORRETAMENTE; enquanto errado, permanece pendente e pode impedir o avanço.
    Motivado pelo pedido explícito do usuário — "enquanto uma estação não for
    resolvida corretamente ela não será validada, ficando pendente para resolução"
    — confirmado após alertar sobre o conflito com a redação anterior do princípio.
    A garantia de retentativa ilimitada, imediata e sem penalidade adicional é
    mantida e explicitada, assim como a proibição de "tentativas limitadas" — só a
    garantia de nunca bloquear o avanço foi revertida.)
Added sections: none
Removed sections: none
Sections updated:
  - Governance → Revisão de conformidade (nenhuma mudança de texto necessária —
    referência ao Princípio IV já era genérica)
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

### II. Front-end Simples com Backend Mínimo e Justificado

A experiência de jogo (trilhas, estações, perguntas, certificado) DEVE continuar
implementada como front-end simples (HTML/CSS/JS, sem framework, sem bundler, sem
passo de build) e continuar funcionando para o aluno sem etapa de instalação. É
PROIBIDO introduzir backend, servidor ou banco de dados para qualquer finalidade fora
do escopo abaixo, sem antes emendar esta constituição.

É PERMITIDO um backend mínimo (API leve + banco de dados) exclusivamente para:
autenticar o professor administrador e, quando aplicável, alunos (login próprio,
com senha definida pelo aluno ou senha padrão gerada no cadastro); e
armazenar/consultar as habilitações de alunos às trilhas (incluindo o cadastro do
aluno associado a essas habilitações). Toda função nova que dependa de backend fora
desse escopo exige emenda formal a este princípio antes da implementação.

**Racional**: simplicidade de distribuição continua sendo a meta para a experiência
de jogo em si — o professor compartilha o jogo diretamente com as turmas, sem
infraestrutura própria de hospedagem para o conteúdo pedagógico. Mas controlar quais
alunos acessam quais trilhas exige um segredo protegido (senha) e um estado
compartilhado entre dispositivos (habilitação), o que não é alcançável com segurança
real usando apenas armazenamento local do navegador — isso vale tanto para a
credencial do professor quanto, a partir da necessidade de conceder acesso
individual ao aluno com senha própria, para a credencial do aluno também; um backend
mínimo e estritamente escopado a autenticação/habilitação é o menor desvio da
simplicidade original que ainda atende esse requisito de negócio.

### III. Rigor Pedagógico e Fidelidade de Conteúdo

Todo gerador de pergunta, cálculo, conversão de base, explicação de erro e tabela de
apoio DEVE estar tecnicamente correto e alinhado à referência bibliográfica adotada
(STALLINGS, W. *Arquitetura e organização de computadores*. 10. ed. Pearson, 2017,
cap. 9 e 10) e ao conteúdo das Aulas 02 e 03. Qualquer nova estação, pergunta ou
explicação DEVE ser validada manualmente (cálculo conferido à mão ou por script) antes
de entrar em uso com as turmas.

**Racional**: o jogo substitui parte da fixação de conteúdo pós-aula; um erro de
cálculo no próprio material de estudo prejudica diretamente o aprendizado do aluno.

### IV. Validação por Acerto com Retentativa Sempre Disponível

Uma estação ou objeto interativo só é considerado validado/resolvido quando
respondido CORRETAMENTE. Enquanto a resposta estiver errada, ele permanece pendente
e PODE impedir o avanço para a próxima sala/estação/trilha — esse bloqueio é sempre
temporário e reversível: o aluno consegue destravá-lo a qualquer momento respondendo
corretamente, sem limite de tentativas. Toda resposta incorreta DEVE continuar
exibindo imediatamente a explicação do cálculo correto, e o aluno DEVE poder tentar
novamente de imediato, sem espera artificial. É proibido qualquer mecanismo de
"tentativas limitadas" (ex.: número máximo de erros permitido) ou qualquer bloqueio
que não seja destravável respondendo corretamente — o único jeito de ficar
definitivamente impedido de avançar é nunca acertar, o que permanece sob controle do
próprio aluno a qualquer momento.

**Racional**: exigir a resposta correta para validar uma estação reforça o rigor
pedagógico — "estação concluída" passa a significar que o aluno de fato demonstrou
domínio do conteúdo, não só que tentou uma vez. A retentativa sempre disponível, sem
limite e sem penalidade adicional além da já prevista (ex.: perda de pontos por usar
dica), evita que isso vire punição ou eliminação: o aluno erra, entende o porquê pela
explicação imediata, tenta de novo, e avança assim que realmente acerta — mantendo o
engajamento do jogo sério sem abrir mão da comprovação real de aprendizado.

### V. Personalização e Variabilidade das Perguntas

Dados informados pelo aluno (nome, idade, matrícula, turma) DEVEM ser usados para
personalizar perguntas sempre que a estação permitir (ex.: converter a própria idade,
montar o próprio nome em ASCII). Cada estação DEVE manter um banco (pool) de
geradores de pergunta com valores aleatorizados, de modo que repetir a trilha não
repita as mesmas perguntas na mesma ordem ou com os mesmos valores.

**Racional**: personalização aumenta engajamento e dificulta cola entre colegas;
variabilidade permite reuso da trilha para reforço sem memorização de respostas.

## Restrições Técnicas e Privacidade

- Persistência em backend é permitida apenas no escopo do Princípio II
  (autenticação do professor e de alunos, e habilitação de alunos): o backend pode
  armazenar a credencial do professor e a credencial do aluno (senha protegida,
  nunca texto claro, mesmo padrão de proteção para os dois) e o cadastro do aluno
  associado às habilitações (nome, idade, matrícula, turma, e-mail institucional).
  Fora desse escopo, o restante do estado de uma sessão de jogo em andamento
  (respostas, progresso dentro de uma trilha) continua vivendo apenas em memória/
  sessão do navegador, sem necessidade de persistência adicional.
- O cadastro do aluno MUST usar e-mail do domínio institucional `@unidavi.edu.br`;
  cadastros com e-mail de outro domínio MUST ser rejeitados.
- O código-fonte da experiência de jogo permanece HTML/CSS/JS puro (vanilla), sem
  frameworks front-end, sem dependências via CDN e sem etapa de transpilação/build. O
  backend mínimo autorizado pelo Princípio II fica isolado dessa regra, mas deve ser
  o menor possível (API leve + banco de dados, sem plataforma adicional além do
  necessário para autenticação e habilitação).
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
acima, em especial o Princípio I (idioma) e o Princípio II (front-end simples,
backend mínimo e justificado apenas para autenticação de professor/aluno e
habilitação de aluno).

**Version**: 3.0.0 | **Ratified**: 2026-08-18 | **Last Amended**: 2026-08-20
