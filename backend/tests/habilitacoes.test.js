import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { loginHandler } from '../src/auth.js';
import { cadastroHandler } from '../src/alunos.js';
import {
  habilitarTurmaHandler,
  revogarTurmaHandler,
  habilitarAlunoHandler,
  verificarHabilitacaoHandler,
} from '../src/habilitacoes.js';
import { resetDb, seedProfessor, requestJSON } from './setup.js';

async function login() {
  const resp = await loginHandler({
    request: requestJSON('POST', { usuario: 'ademar', senha: 'senha-correta-123' }),
    env,
  });
  return (await resp.json()).token;
}

async function cadastrarAluno(matricula, turma) {
  await cadastroHandler({
    request: requestJSON('POST', {
      nome: 'Aluno ' + matricula, idade: 20, matricula, turma, email: `${matricula}@unidavi.edu.br`,
    }),
    env,
  });
}

describe('habilitacoes', () => {
  let token;

  beforeEach(async () => {
    await resetDb(env);
    await seedProfessor(env, 'ademar', 'senha-correta-123');
    token = await login();
  });

  it('habilitar turma inteira libera acesso para aluno da turma (FR-007, FR-009)', async () => {
    await cadastrarAluno('2026010', 'T33F2');

    const habilitar = await habilitarTurmaHandler({
      request: requestJSON('POST', { trilha: 'arquitetura' }, { Authorization: `Bearer ${token}` }),
      env,
      params: { turma: 'T33F2' },
    });
    expect(habilitar.status).toBe(200);

    const check = await verificarHabilitacaoHandler({
      env,
      params: { matricula: '2026010', trilha: 'arquitetura' },
    });
    expect((await check.json()).habilitado).toBe(true);
  });

  it('aluno de outra turma não habilitada continua bloqueado', async () => {
    await cadastrarAluno('2026011', 'T34F2');
    await habilitarTurmaHandler({
      request: requestJSON('POST', { trilha: 'arquitetura' }, { Authorization: `Bearer ${token}` }),
      env,
      params: { turma: 'T33F2' },
    });

    const check = await verificarHabilitacaoHandler({
      env,
      params: { matricula: '2026011', trilha: 'arquitetura' },
    });
    expect((await check.json()).habilitado).toBe(false);
  });

  it('exceção individual concedida=false bloqueia aluno mesmo com turma habilitada (US2 cenário 3)', async () => {
    await cadastrarAluno('2026012', 'T33F2');
    await habilitarTurmaHandler({
      request: requestJSON('POST', { trilha: 'linguagens' }, { Authorization: `Bearer ${token}` }),
      env,
      params: { turma: 'T33F2' },
    });
    await habilitarAlunoHandler({
      request: requestJSON('POST', { trilha: 'linguagens', concedida: false }, { Authorization: `Bearer ${token}` }),
      env,
      params: { matricula: '2026012' },
    });

    const check = await verificarHabilitacaoHandler({
      env,
      params: { matricula: '2026012', trilha: 'linguagens' },
    });
    expect((await check.json()).habilitado).toBe(false);
  });

  it('revogar habilitação de turma remove acesso de quem não tem exceção individual', async () => {
    await cadastrarAluno('2026013', 'T33F2');
    await habilitarTurmaHandler({
      request: requestJSON('POST', { trilha: 'arquitetura' }, { Authorization: `Bearer ${token}` }),
      env,
      params: { turma: 'T33F2' },
    });
    await revogarTurmaHandler({
      request: requestJSON('DELETE', undefined, { Authorization: `Bearer ${token}` }),
      env,
      params: { turma: 'T33F2', trilha: 'arquitetura' },
    });

    const check = await verificarHabilitacaoHandler({
      env,
      params: { matricula: '2026013', trilha: 'arquitetura' },
    });
    expect((await check.json()).habilitado).toBe(false);
  });

  it('habilitar turma com nome inválido é rejeitado (FR-013)', async () => {
    const resp = await habilitarTurmaHandler({
      request: requestJSON('POST', { trilha: 'arquitetura' }, { Authorization: `Bearer ${token}` }),
      env,
      params: { turma: 'T99X9' },
    });
    expect(resp.status).toBe(400);
  });
});
