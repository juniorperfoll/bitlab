// Acesso ao SQLite local via better-sqlite3 (síncrono, zero servidor de banco).
// Todas as funções recebem a instância `db` já aberta e retornam dados já no
// formato usado pelas rotas — nenhuma lógica HTTP aqui.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, '..', 'migrations', '0001_init.sql');

// `dbPath` pode ser um caminho de arquivo ou ':memory:' (usado nos testes).
export function abrirDb(dbPath) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  return db;
}

export function getProfessor(db) {
  return db.prepare('SELECT * FROM professores LIMIT 1').get();
}

export function getProfessorPorUsuario(db, usuario) {
  return db.prepare('SELECT * FROM professores WHERE usuario = ?').get(usuario);
}

export function getProfessorByToken(db, token) {
  return db.prepare('SELECT * FROM professores WHERE token_ativo = ?').get(token);
}

export function setProfessorToken(db, professorId, token) {
  db.prepare('UPDATE professores SET token_ativo = ? WHERE id = ?').run(token, professorId);
}

export function clearProfessorToken(db, professorId) {
  db.prepare('UPDATE professores SET token_ativo = NULL WHERE id = ?').run(professorId);
}

// Provisionamento/redefinição manual da credencial (FR-012, FR-017) — usado tanto
// pelo script de seed local quanto pelo bootstrap via env var em server.js.
export function upsertProfessorCredencial(db, usuario, senhaHash, senhaSalt) {
  db.prepare(
    `INSERT INTO professores (usuario, senha_hash, senha_salt, criado_em)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT (usuario) DO UPDATE SET
       senha_hash = excluded.senha_hash,
       senha_salt = excluded.senha_salt,
       token_ativo = NULL`
  ).run(usuario, senhaHash, senhaSalt);
}

export function getAlunoByMatricula(db, matricula) {
  return db.prepare('SELECT * FROM alunos WHERE matricula = ?').get(matricula);
}

export function upsertAluno(db, { matricula, nome, idade, turma, email }) {
  db.prepare(
    `INSERT INTO alunos (matricula, nome, idade, turma, email, criado_em, atualizado_em)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
     ON CONFLICT (matricula) DO UPDATE SET
       nome = excluded.nome,
       idade = excluded.idade,
       turma = excluded.turma,
       email = excluded.email,
       atualizado_em = datetime('now')`
  ).run(matricula, nome, idade, turma, email);
  return getAlunoByMatricula(db, matricula);
}

export function listAlunosComHabilitacoes(db) {
  const alunos = db.prepare('SELECT * FROM alunos ORDER BY turma, nome').all();
  const habilitacoesIndividuais = db
    .prepare("SELECT * FROM habilitacoes WHERE escopo = 'individual'")
    .all();
  const habilitacoesTurma = db
    .prepare("SELECT * FROM habilitacoes WHERE escopo = 'turma'")
    .all();

  return alunos.map((aluno) => {
    const resultado = {};
    for (const trilha of ['arquitetura', 'linguagens']) {
      resultado[trilha] = resolverHabilitacao({
        aluno,
        trilha,
        habilitacoesTurma,
        habilitacoesIndividuais,
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

export function upsertHabilitacaoTurma(db, turma, trilha, concedida) {
  db.prepare(
    `INSERT INTO habilitacoes (escopo, turma, trilha, concedida, atualizado_em)
     VALUES ('turma', ?, ?, ?, datetime('now'))
     ON CONFLICT (turma, trilha) WHERE escopo = 'turma' DO UPDATE SET
       concedida = excluded.concedida,
       atualizado_em = datetime('now')`
  ).run(turma, trilha, concedida ? 1 : 0);
}

export function deleteHabilitacaoTurma(db, turma, trilha) {
  db.prepare(
    "DELETE FROM habilitacoes WHERE escopo = 'turma' AND turma = ? AND trilha = ?"
  ).run(turma, trilha);
}

export function upsertHabilitacaoIndividual(db, alunoId, trilha, concedida) {
  db.prepare(
    `INSERT INTO habilitacoes (escopo, aluno_id, trilha, concedida, atualizado_em)
     VALUES ('individual', ?, ?, ?, datetime('now'))
     ON CONFLICT (aluno_id, trilha) WHERE escopo = 'individual' DO UPDATE SET
       concedida = excluded.concedida,
       atualizado_em = datetime('now')`
  ).run(alunoId, trilha, concedida ? 1 : 0);
}

export function deleteHabilitacaoIndividual(db, alunoId, trilha) {
  db.prepare(
    "DELETE FROM habilitacoes WHERE escopo = 'individual' AND aluno_id = ? AND trilha = ?"
  ).run(alunoId, trilha);
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

export function getHabilitacaoResolvida(db, matricula, trilha) {
  const aluno = getAlunoByMatricula(db, matricula);
  if (!aluno) return false;

  const excecao = db
    .prepare(
      "SELECT concedida FROM habilitacoes WHERE escopo = 'individual' AND aluno_id = ? AND trilha = ?"
    )
    .get(aluno.id, trilha);
  if (excecao) return excecao.concedida === 1;

  const daTurma = db
    .prepare(
      "SELECT concedida FROM habilitacoes WHERE escopo = 'turma' AND turma = ? AND trilha = ?"
    )
    .get(aluno.turma, trilha);
  return daTurma ? daTurma.concedida === 1 : false;
}
