// Acesso ao D1. Todas as funções recebem o binding `db` (env.DB) e retornam
// dados já no formato usado pelas rotas — nenhuma lógica HTTP aqui.

export async function getProfessor(db) {
  return db.prepare('SELECT * FROM professores LIMIT 1').first();
}

export async function getProfessorPorUsuario(db, usuario) {
  return db
    .prepare('SELECT * FROM professores WHERE usuario = ?')
    .bind(usuario)
    .first();
}

export async function getProfessorByToken(db, token) {
  return db
    .prepare('SELECT * FROM professores WHERE token_ativo = ?')
    .bind(token)
    .first();
}

export async function setProfessorToken(db, professorId, token) {
  await db
    .prepare('UPDATE professores SET token_ativo = ? WHERE id = ?')
    .bind(token, professorId)
    .run();
}

export async function clearProfessorToken(db, professorId) {
  await db
    .prepare('UPDATE professores SET token_ativo = NULL WHERE id = ?')
    .bind(professorId)
    .run();
}

export async function setProfessorSenha(db, professorId, senhaHash, senhaSalt) {
  await db
    .prepare(
      'UPDATE professores SET senha_hash = ?, senha_salt = ?, token_ativo = NULL WHERE id = ?'
    )
    .bind(senhaHash, senhaSalt, professorId)
    .run();
}

export async function getAlunoByMatricula(db, matricula) {
  return db
    .prepare('SELECT * FROM alunos WHERE matricula = ?')
    .bind(matricula)
    .first();
}

export async function upsertAluno(db, { matricula, nome, idade, turma, email }) {
  await db
    .prepare(
      `INSERT INTO alunos (matricula, nome, idade, turma, email, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT (matricula) DO UPDATE SET
         nome = excluded.nome,
         idade = excluded.idade,
         turma = excluded.turma,
         email = excluded.email,
         atualizado_em = datetime('now')`
    )
    .bind(matricula, nome, idade, turma, email)
    .run();
  return getAlunoByMatricula(db, matricula);
}

export async function listAlunosComHabilitacoes(db) {
  const { results: alunos } = await db
    .prepare('SELECT * FROM alunos ORDER BY turma, nome')
    .all();
  const { results: habilitacoes } = await db
    .prepare("SELECT * FROM habilitacoes WHERE escopo = 'individual'")
    .all();
  const { results: habilitacoesTurma } = await db
    .prepare("SELECT * FROM habilitacoes WHERE escopo = 'turma'")
    .all();

  return alunos.map((aluno) => {
    const resultado = {};
    for (const trilha of ['arquitetura', 'linguagens']) {
      resultado[trilha] = resolverHabilitacao({
        aluno,
        trilha,
        habilitacoesTurma,
        habilitacoesIndividuais: habilitacoes,
      });
    }
    return {
      matricula: aluno.matricula,
      nome: aluno.nome,
      turma: aluno.turma,
      email: aluno.email,
      habilitacoes: resultado,
    };
  });
}

export async function upsertHabilitacaoTurma(db, turma, trilha, concedida) {
  await db
    .prepare(
      `INSERT INTO habilitacoes (escopo, turma, trilha, concedida, atualizado_em)
       VALUES ('turma', ?, ?, ?, datetime('now'))
       ON CONFLICT (turma, trilha) WHERE escopo = 'turma' DO UPDATE SET
         concedida = excluded.concedida,
         atualizado_em = datetime('now')`
    )
    .bind(turma, trilha, concedida ? 1 : 0)
    .run();
}

export async function deleteHabilitacaoTurma(db, turma, trilha) {
  await db
    .prepare(
      "DELETE FROM habilitacoes WHERE escopo = 'turma' AND turma = ? AND trilha = ?"
    )
    .bind(turma, trilha)
    .run();
}

export async function upsertHabilitacaoIndividual(db, alunoId, trilha, concedida) {
  await db
    .prepare(
      `INSERT INTO habilitacoes (escopo, aluno_id, trilha, concedida, atualizado_em)
       VALUES ('individual', ?, ?, ?, datetime('now'))
       ON CONFLICT (aluno_id, trilha) WHERE escopo = 'individual' DO UPDATE SET
         concedida = excluded.concedida,
         atualizado_em = datetime('now')`
    )
    .bind(alunoId, trilha, concedida ? 1 : 0)
    .run();
}

export async function deleteHabilitacaoIndividual(db, alunoId, trilha) {
  await db
    .prepare(
      "DELETE FROM habilitacoes WHERE escopo = 'individual' AND aluno_id = ? AND trilha = ?"
    )
    .bind(alunoId, trilha)
    .run();
}

// Regra de resolução de acesso (data-model.md): exceção individual concedida=true
// vence; exceção individual concedida=false bloqueia mesmo com turma habilitada;
// caso contrário, vale a habilitação de turma.
function resolverHabilitacao({ aluno, trilha, habilitacoesTurma, habilitacoesIndividuais }) {
  const excecao = habilitacoesIndividuais.find(
    (h) => h.aluno_id === aluno.id && h.trilha === trilha
  );
  if (excecao) return excecao.concedida === 1;

  const daTurma = habilitacoesTurma.find(
    (h) => h.turma === aluno.turma && h.trilha === trilha
  );
  return daTurma ? daTurma.concedida === 1 : false;
}

export async function getHabilitacaoResolvida(db, matricula, trilha) {
  const aluno = await getAlunoByMatricula(db, matricula);
  if (!aluno) return false;

  const excecao = await db
    .prepare(
      "SELECT concedida FROM habilitacoes WHERE escopo = 'individual' AND aluno_id = ? AND trilha = ?"
    )
    .bind(aluno.id, trilha)
    .first();
  if (excecao) return excecao.concedida === 1;

  const daTurma = await db
    .prepare(
      "SELECT concedida FROM habilitacoes WHERE escopo = 'turma' AND turma = ? AND trilha = ?"
    )
    .bind(aluno.turma, trilha)
    .first();
  return daTurma ? daTurma.concedida === 1 : false;
}
