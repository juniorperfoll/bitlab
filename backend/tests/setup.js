import { criarApp } from '../src/app.js';
import { upsertProfessorCredencial } from '../src/db.js';
import { gerarHashSenha } from '../src/auth.js';

// Uma instância de app + banco ':memory:' nova por chamada — isolamento total
// entre testes, sem precisar limpar tabelas manualmente.
export function criarAppDeTeste() {
  return criarApp(':memory:');
}

export function seedProfessor(app, usuario, senha) {
  const { hash, salt } = gerarHashSenha(senha);
  upsertProfessorCredencial(app.locals.db, usuario, hash, salt);
}
