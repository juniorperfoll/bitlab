# Research: Importação de Alunos com Senha Padrão de Primeiro Acesso

## 1. Hash de senha e token de sessão do aluno

**Decision**: reaproveitar exatamente as funções já existentes em
`backend/src/auth.js` (`gerarHashSenha`, `verificarSenha`, `gerarToken`) — nenhuma é
específica de professor, todas recebem/retornam só string, então servem igual para
aluno.

**Rationale**: zero código novo de criptografia; consistência total de segurança
entre as duas credenciais do sistema (professor e aluno); qualquer auditoria de
segurança futura revisa um único mecanismo.

**Alternatives considered**:
- Mecanismo de hash separado "mais simples" para aluno, já que a senha padrão é
  curta/previsível — rejeitado: não há ganho nenhum em ter dois padrões de hash no
  mesmo projeto, só risco de um dos dois ficar desatualizado/mal mantido.

## 2. Sessão do aluno: token único vs. múltiplos dispositivos

**Decision**: mesma modelagem do professor — coluna `token_ativo` na linha do aluno
(tabela `alunos`), um único token válido por vez. Login novo substitui o token
anterior (sessão em outro dispositivo/aba é derrubada silenciosamente).

**Rationale**: menor mecanismo possível (uma coluna, sem tabela de sessões
separada); consistente com o padrão já adotado para o professor (research.md #4 da
feature 001); a spec não pede suporte a múltiplos dispositivos simultâneos para o
aluno, e um aluno jogando ao mesmo tempo em dois lugares não é um cenário que a
feature precisa otimizar.

**Alternatives considered**:
- Múltiplos tokens simultâneos por aluno (tabela `sessoes_alunos`) — mais peças
  móveis sem requisito que justifique; SC-004 da feature 001 (persistência de
  habilitação entre dispositivos) já é satisfeita independente disso, porque
  habilitação é consultada por matrícula, não por sessão.

## 3. Como a senha padrão é derivada do e-mail

**Decision**: parte local do e-mail (tudo antes de `@unidavi.edu.br`), normalizada
para minúsculas. Ex.: `Joao.Silva@unidavi.edu.br` → senha padrão `joao.silva`.

**Rationale**: atende literalmente o pedido ("a senha será o e-mail sem a parte do
domínio"); normalizar para minúsculas evita fricção de digitação (maiúscula/minúscula
em teclado de celular) sem enfraquecer a senha além do que ela já é (uma senha
temporária previsível por design, trocada no primeiro acesso — ver decisão #6).

**Alternatives considered**:
- Manter a capitalização exata como veio no cadastro — rejeitado: adiciona chance de
  erro de digitação sem nenhum ganho de segurança real (a senha é temporária de
  qualquer forma).

## 4. Diferenciar criação (gera senha) de atualização (preserva senha) na importação

**Decision**: no handler de importação/cadastro, buscar o aluno por matrícula
explicitamente antes de decidir a ação: se não existe → insere com senha padrão
gerada e `senha_padrao_ativa = 1`; se já existe → só atualiza nome/turma/e-mail,
nunca toca em `senha_hash`/`senha_salt`/`senha_padrao_ativa`.

**Rationale**: `upsertAluno` (feature 001) usa `ON CONFLICT ... DO UPDATE`, que não
distingue facilmente "foi insert" de "foi update" no retorno do better-sqlite3 sem um
`SELECT` adicional; como a diferença de comportamento (gerar senha ou não) é exigida
pelo FR-002/FR-003, é mais simples e explícito checar a existência antes, em vez de
tentar inferir do resultado do upsert.

**Alternatives considered**:
- Sempre resetar a senha padrão a cada importação — rejeitado explicitamente pela
  spec (Edge Cases): apagaria sem querer a senha própria de quem já trocou.

## 5. Formato de importação em lote

**Decision**: texto colado em um `<textarea>` no `admin.html`, uma linha por aluno,
campos separados por vírgula ou ponto e vírgula, na ordem
`matricula,nome,email,turma` — sem linha de cabeçalho (o backend trata toda linha
não vazia como um registro de aluno).

**Rationale**: já decidido em spec.md (Assumptions) para evitar upload de arquivo no
backend mínimo. Ordem fixa e sem cabeçalho elimina ambiguidade de parsing sem exigir
nenhuma biblioteca de CSV.

**Alternatives considered**:
- Detectar automaticamente se a primeira linha é um cabeçalho — rejeitado: mais
  lógica de heurística para um ganho pequeno; a área administrativa já mostra um
  exemplo do formato esperado acima do campo, o que resolve a usabilidade sem
  precisar de detecção mágica.

## 6. Obrigatoriedade de troca de senha no primeiro acesso

**Decision**: já registrado em spec.md (Assumptions) — obrigatório, não apenas
sugerido. Tecnicamente: após um login bem-sucedido com `senha_padrao_ativa = 1`, o
token emitido só autoriza o endpoint de troca de senha; qualquer outra rota que exija
autenticação de aluno (ex.: consultar habilitação em nome próprio, se vier a existir)
deve verificar essa flag e recusar até a troca ser concluída.

**Rationale**: fecha a lacuna de senha previsível descrita no research.md #3, sem
inventar um mecanismo novo — é a mesma ideia de "conta com senha temporária" usada em
praticamente todo sistema corporativo.

**Alternatives considered**:
- Apenas avisar/sugerir a troca sem bloquear — rejeitado na spec pelas mesmas razões
  de segurança (certificado de presença como comprovação, senha adivinhável a partir
  do padrão de e-mail institucional).

## 7. Extensão de `backend/src/alunos.js` sem quebrar o cadastro público existente

**Decision**: o handler `cadastroHandler` (auto-cadastro do aluno, `POST
/api/alunos/cadastro`, feature 001) passa a, na criação de um aluno novo, também
gerar a senha padrão e marcar `senha_padrao_ativa = 1` — reaproveitando a mesma
lógica de decisão 4 acima. Em atualização de aluno já existente, comportamento
inalterado.

**Rationale**: atende FR-006 (todo aluno com cadastro criado, seja por importação ou
autocadastro, sai já com senha padrão) sem duplicar a rota nem criar dois caminhos de
cadastro divergentes.

**Alternatives considered**:
- Gerar senha só para alunos importados pelo professor, deixando o autocadastro sem
  senha — rejeitado: geraria dois tipos de aluno com comportamento de login
  diferente, contradizendo FR-006 e complicando a UI do jogo (teria que saber, antes
  de perguntar, se aquele aluno tem senha ou não, sem nenhum sinal externo confiável
  além de tentar buscar por matrícula primeiro — o que a decisão acima já assume como
  necessário de qualquer forma).
