import { listAlunosComHabilitacoes, upsertAluno, getAlunoByMatricula, getAlunoByEmail, setSenhaAluno, setTokenAluno } from './db.js';
import { TURMAS_VALIDAS } from './habilitacoes.js';
import { gerarHashSenha, verificarSenha, gerarToken } from './auth.js';

const DOMINIO_INSTITUCIONAL = '@unidavi.edu.br';

// Senha padrão de primeiro acesso (feature 002) — parte local do e-mail
// institucional, em minúsculas. Ex.: "Joao.Silva@unidavi.edu.br" → "joao.silva".
export function gerarSenhaPadrao(email) {
  return String(email).split('@')[0].toLowerCase();
}

// Cria o aluno com senha padrão gerada se a matrícula ainda não existe; se já
// existe, só atualiza nome/idade/turma/email, nunca mexendo na senha (FR-002,
// FR-003 — ver research.md #4). Usado tanto pelo cadastro individual quanto pela
// importação em lote.
export function criarOuAtualizarAluno(db, dados) {
  const existente = getAlunoByMatricula(db, dados.matricula);
  const aluno = upsertAluno(db, dados);
  if (!existente) {
    const { hash, salt } = gerarHashSenha(gerarSenhaPadrao(dados.email));
    setSenhaAluno(db, aluno.id, hash, salt, true);
  }
  return { aluno, criado: !existente };
}

// GET /api/alunos (auth) — lista alunos com habilitações por trilha, para o
// painel administrativo renderizar a tela de gestão.
export function listarAlunosHandler(req, res) {
  const alunos = listAlunosComHabilitacoes(req.app.locals.db);
  res.json({ alunos });
}

// Placeholder de idade para alunos importados pelo professor (a lista de
// importação, per spec.md, só traz matrícula/nome/e-mail/turma — sem idade). Mesma
// faixa usada como fallback no front-end (index.html) para aluno autocadastrado sem
// idade válida, só para manter os geradores de pergunta personalizados funcionando;
// não representa a idade real do aluno.
function gerarIdadePlaceholder() {
  return Math.floor(Math.random() * (45 - 17 + 1)) + 17;
}

// Interpreta uma linha "matricula,nome,email,turma" (vírgula ou ponto e vírgula).
// Retorna null se a linha não tiver exatamente 4 campos não vazios.
function parseLinhaImportacao(linha) {
  const campos = linha.split(/[,;]/).map((c) => c.trim());
  if (campos.length !== 4 || campos.some((c) => !c)) return null;
  const [matricula, nome, email, turma] = campos;
  return { matricula, nome, email, turma };
}

// POST /api/alunos/importar (auth-professor) — importação em lote (FR-001 a FR-005).
export function importarHandler(req, res) {
  const { linhas } = req.body || {};
  if (!linhas || typeof linhas !== 'string' || !linhas.trim()) {
    return res.status(400).json({ mensagem: 'Envie a lista de alunos para importar.' });
  }

  const db = req.app.locals.db;
  let criados = 0;
  let atualizados = 0;
  const rejeitados = [];

  linhas.split('\n').forEach((linhaTexto, indice) => {
    const linha = linhaTexto.trim();
    if (!linha) return;

    const numeroLinha = indice + 1;
    const dados = parseLinhaImportacao(linha);
    if (!dados) {
      rejeitados.push({ linha: numeroLinha, motivo: 'Linha mal formatada. Use matricula,nome,email,turma.' });
      return;
    }
    if (!TURMAS_VALIDAS.includes(dados.turma)) {
      rejeitados.push({ linha: numeroLinha, motivo: 'Turma inválida. Use T33F2 ou T34F2.' });
      return;
    }
    if (!dados.email.toLowerCase().endsWith(DOMINIO_INSTITUCIONAL)) {
      rejeitados.push({ linha: numeroLinha, motivo: 'E-mail fora do domínio institucional.' });
      return;
    }

    const { criado } = criarOuAtualizarAluno(db, { ...dados, idade: gerarIdadePlaceholder() });
    if (criado) criados++; else atualizados++;
  });

  res.json({ criados, atualizados, rejeitados });
}

// POST /api/alunos/:matricula/redefinir-senha (auth-professor) — FR-011.
export function redefinirSenhaHandler(req, res) {
  const db = req.app.locals.db;
  const aluno = getAlunoByMatricula(db, req.params.matricula);
  if (!aluno) {
    return res.status(404).json({ mensagem: 'Aluno não encontrado para essa matrícula.' });
  }

  const { hash, salt } = gerarHashSenha(gerarSenhaPadrao(aluno.email));
  setSenhaAluno(db, aluno.id, hash, salt, true);
  res.json({ ok: true });
}

// POST /api/alunos/login (público) — FR-006, FR-007.
export function alunoLoginHandler(req, res) {
  const { identificador, senha } = req.body || {};
  if (!identificador || !senha) {
    return res.status(400).json({ mensagem: 'Informe matrícula/e-mail e senha.' });
  }

  const db = req.app.locals.db;
  const aluno = String(identificador).includes('@')
    ? getAlunoByEmail(db, identificador)
    : getAlunoByMatricula(db, identificador);
  if (!aluno || !aluno.senha_hash || !verificarSenha(senha, aluno.senha_hash, aluno.senha_salt)) {
    return res.status(401).json({ mensagem: 'Matrícula/e-mail ou senha incorretos.' });
  }

  const token = gerarToken();
  setTokenAluno(db, aluno.id, token);
  res.json({
    token,
    precisaTrocarSenha: aluno.senha_padrao_ativa === 1,
    nome: aluno.nome,
    turma: aluno.turma,
    matricula: aluno.matricula,
  });
}

// POST /api/alunos/senha (auth-aluno) — FR-009, FR-010. `req.aluno` vem do
// autenticarAlunoMiddleware (backend/src/auth.js), aplicado na rota em app.js.
export function trocarSenhaHandler(req, res) {
  const { novaSenha } = req.body || {};
  if (!novaSenha) {
    return res.status(400).json({ mensagem: 'Informe uma nova senha.' });
  }

  const { hash, salt } = gerarHashSenha(novaSenha);
  setSenhaAluno(req.app.locals.db, req.aluno.id, hash, salt, false);
  res.json({ ok: true });
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

  criarOuAtualizarAluno(req.app.locals.db, { matricula, nome, idade, turma, email });
  res.json({ ok: true });
}
