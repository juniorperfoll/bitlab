import {
  getAlunoByMatricula,
  upsertHabilitacaoTurma,
  deleteHabilitacaoTurma,
  upsertHabilitacaoIndividual,
  deleteHabilitacaoIndividual,
  getHabilitacaoResolvida,
} from './db.js';

export const TURMAS_VALIDAS = ['T33F2', 'T34F2', 'TLPP'];
export const TRILHAS_VALIDAS = ['arquitetura', 'linguagens'];
export const MENSAGEM_TURMA_INVALIDA = `Turma inválida. Use ${TURMAS_VALIDAS.join(', ')}.`;

function turmaValida(turma) {
  return TURMAS_VALIDAS.includes(turma);
}

function trilhaValida(trilha) {
  return TRILHAS_VALIDAS.includes(trilha);
}

// POST /api/turmas/:turma/habilitacoes (auth) — FR-007, SC-001.
export function habilitarTurmaHandler(req, res) {
  if (!turmaValida(req.params.turma)) {
    return res.status(400).json({ mensagem: MENSAGEM_TURMA_INVALIDA });
  }

  const { trilha } = req.body || {};
  if (!trilhaValida(trilha)) {
    return res.status(400).json({ mensagem: 'Trilha inválida.' });
  }

  upsertHabilitacaoTurma(req.app.locals.db, req.params.turma, trilha, true);
  res.json({ ok: true });
}

// DELETE /api/turmas/:turma/habilitacoes/:trilha (auth) — revoga a habilitação em
// lote da turma (não afeta exceções individuais já concedidas separadamente).
export function revogarTurmaHandler(req, res) {
  if (!turmaValida(req.params.turma) || !trilhaValida(req.params.trilha)) {
    return res.status(400).json({ mensagem: 'Turma ou trilha inválida.' });
  }

  deleteHabilitacaoTurma(req.app.locals.db, req.params.turma, req.params.trilha);
  res.json({ ok: true });
}

// POST /api/alunos/:matricula/habilitacoes (auth) — FR-008: concede ou revoga
// (concedida:false) individualmente, inclusive como exceção sobre a turma.
export function habilitarAlunoHandler(req, res) {
  const aluno = getAlunoByMatricula(req.app.locals.db, req.params.matricula);
  if (!aluno) {
    return res.status(404).json({ mensagem: 'Aluno não encontrado para essa matrícula.' });
  }

  const { trilha, concedida } = req.body || {};
  if (!trilhaValida(trilha) || typeof concedida !== 'boolean') {
    return res.status(400).json({ mensagem: 'Informe trilha válida e concedida (true/false).' });
  }

  upsertHabilitacaoIndividual(req.app.locals.db, aluno.id, trilha, concedida);
  res.json({ ok: true });
}

// DELETE /api/alunos/:matricula/habilitacoes/:trilha (auth) — remove a exceção
// individual, voltando a valer só a habilitação de turma (se houver).
export function revogarAlunoHandler(req, res) {
  const aluno = getAlunoByMatricula(req.app.locals.db, req.params.matricula);
  if (!aluno) {
    return res.status(404).json({ mensagem: 'Aluno não encontrado para essa matrícula.' });
  }

  if (!trilhaValida(req.params.trilha)) {
    return res.status(400).json({ mensagem: 'Trilha inválida.' });
  }

  deleteHabilitacaoIndividual(req.app.locals.db, aluno.id, req.params.trilha);
  res.json({ ok: true });
}

// GET /api/alunos/:matricula/habilitacoes/:trilha (público) — FR-009, US3.
// Chamado pela tela inicial do jogo antes de iniciar a trilha escolhida.
export function verificarHabilitacaoHandler(req, res) {
  if (!trilhaValida(req.params.trilha)) {
    return res.status(400).json({ mensagem: 'Trilha inválida.' });
  }

  const habilitado = getHabilitacaoResolvida(req.app.locals.db, req.params.matricula, req.params.trilha);
  res.json({ habilitado });
}
