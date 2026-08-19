# Research: Login por E-mail ou Matrícula

## 1. Nome do campo no corpo da requisição de login

**Decision**: renomear o campo do corpo de `POST /api/alunos/login` de `matricula`
para `identificador` (mantendo `senha`). É uma mudança no contrato do endpoint.

**Rationale**: `matricula` deixaria de descrever corretamente o que o campo aceita
(pode ser e-mail agora). Como o único consumidor deste endpoint é o próprio
`backend/public/index.html` deste mesmo projeto, a mudança é segura de fazer em
lockstep (front-end e back-end atualizados juntos), sem quebrar integração externa
nenhuma.

**Alternatives considered**:
- Manter o campo `matricula` no corpo, mas aceitar e-mail nele também — rejeitado:
  o nome ficaria enganoso (`matricula: "fulano@unidavi.edu.br"`), prejudicando
  legibilidade do contrato para qualquer manutenção futura.

## 2. Detecção do formato (e-mail vs. matrícula)

**Decision**: se o valor de `identificador` contém `@`, tratar como e-mail; caso
contrário, tratar como matrícula (aplicando a mesma limpeza de dígitos já usada em
outras rotas, ex. `String(identificador).replace(/\D/g,'')`).

**Rationale**: matrículas são compostas só por dígitos (padrão já estabelecido nas
features 001/002); e-mail sempre contém `@`. Não há sobreposição possível — a
detecção é determinística e não precisa de validação de formato de e-mail mais
sofisticada (a validação completa de "é um e-mail institucional válido" já acontece
no cadastro, não no login).

**Alternatives considered**: nenhuma alternativa séria — qualquer heurística mais
complexa (ex.: regex de e-mail completo) resolveria o mesmo problema com mais
código e nenhum ganho, já que matrícula nunca contém `@`.

## 3. Comparação de e-mail sem diferenciar maiúsculas/minúsculas

**Decision**: nova função `getAlunoByEmail(db, email)` em `backend/src/db.js` usa
`WHERE LOWER(email) = LOWER(?)` na consulta SQL, em vez de comparar o valor exato.

**Rationale**: evita depender de todo e-mail já cadastrado estar salvo em minúsculas
(cadastros antigos podem ter capitalização variada, já que o cadastro original só
normaliza para checar o domínio, não para gravar) — resolve o requisito (FR-003)
sem precisar de migração de dados nem mudar o que já está gravado.

**Alternatives considered**:
- Normalizar todo `email` para minúsculas na gravação (cadastro/importação) e
  comparar direto — mais correto a longo prazo, mas é uma mudança em outro
  endpoint (cadastro/importação, features 001/002) fora do escopo desta spec; a
  comparação `LOWER()` já resolve o requisito sem precisar tocar lá. Pode ser
  revisitado depois, não bloqueia esta feature.

## 4. Mensagem de erro genérica

**Decision**: mensagem de erro passa a ser "Matrícula/e-mail ou senha incorretos."
(era "Matrícula ou senha incorretos.") — continua sem indicar qual dos dois campos
falhou nem qual formato foi tentado (FR-005).

**Rationale**: pequeno ajuste de texto para refletir que agora dois formatos são
aceitos, mantendo a mesma garantia de não vazar informação já estabelecida na
feature 002.
