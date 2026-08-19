import { listAlunosComHabilitacoes, upsertAluno } from './db.js';
import { TURMAS_VALIDAS } from './habilitacoes.js';

const DOMINIO_INSTITUCIONAL = '@unidavi.edu.br';

// GET /api/alunos (auth) — lista alunos com habilitações por trilha, para o
// painel administrativo renderizar a tela de gestão.
export function listarAlunosHandler(req, res) {
  const alunos = listAlunosComHabilitacoes(req.app.locals.db);
  res.json({ alunos });
}

// POST /api/alunos/cadastro (público) — cria/atualiza cadastro do aluno.
// FR-016: só e-mail do domínio institucional. FR-013: só T33F2/T34F2.
export function cadastroHandler(req, res) {
  const { nome, idade, matricula, turma, email } = req.body || {};
  if (!nome || !matricula || !turma || !email || !idade) {
    return res.status(400).json({ mensagem: 'Preencha nome, idade, matrícula, turma e e-mail.' });
  }

  if (!TURMAS_VALIDAS.includes(turma)) {
    return res.status(400).json({ mensagem: 'Turma inválida. Use T33F2 ou T34F2.' });
  }

  if (!String(email).toLowerCase().endsWith(DOMINIO_INSTITUCIONAL)) {
    return res.status(400).json({ mensagem: 'Use um e-mail institucional do domínio @unidavi.edu.br.' });
  }

  upsertAluno(req.app.locals.db, { matricula, nome, idade, turma, email });
  res.json({ ok: true });
}
