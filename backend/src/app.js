// Fábrica da aplicação Express: monta o schema no SQLite, registra as rotas da
// API e serve o jogo/painel estáticos. Separado de server.js para os testes
// poderem criar uma instância isolada (SQLite ':memory:') sem abrir porta HTTP.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { abrirDb } from './db.js';
import { loginHandler, logoutHandler, autenticarMiddleware } from './auth.js';
import { cadastroHandler, listarAlunosHandler } from './alunos.js';
import {
  habilitarTurmaHandler,
  revogarTurmaHandler,
  habilitarAlunoHandler,
  revogarAlunoHandler,
  verificarHabilitacaoHandler,
} from './habilitacoes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

export function criarApp(dbPath) {
  const app = express();
  app.locals.db = abrirDb(dbPath);

  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  app.post('/api/login', loginHandler);
  app.post('/api/logout', autenticarMiddleware, logoutHandler);

  app.post('/api/alunos/cadastro', cadastroHandler);
  app.get('/api/alunos/:matricula/habilitacoes/:trilha', verificarHabilitacaoHandler);
  app.get('/api/alunos', autenticarMiddleware, listarAlunosHandler);

  app.post('/api/turmas/:turma/habilitacoes', autenticarMiddleware, habilitarTurmaHandler);
  app.delete('/api/turmas/:turma/habilitacoes/:trilha', autenticarMiddleware, revogarTurmaHandler);
  app.post('/api/alunos/:matricula/habilitacoes', autenticarMiddleware, habilitarAlunoHandler);
  app.delete('/api/alunos/:matricula/habilitacoes/:trilha', autenticarMiddleware, revogarAlunoHandler);

  app.use(express.static(PUBLIC_DIR));

  app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(500).json({ mensagem: 'Erro interno. Tente novamente em instantes.' });
  });

  return app;
}
