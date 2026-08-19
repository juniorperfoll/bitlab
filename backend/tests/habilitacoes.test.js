import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { criarAppDeTeste, seedProfessor } from './setup.js';

describe('habilitacoes', () => {
  let app;
  let token;

  beforeEach(async () => {
    app = criarAppDeTeste();
    seedProfessor(app, 'ademar', 'senha-correta-123');
    const resp = await request(app)
      .post('/api/login')
      .send({ usuario: 'ademar', senha: 'senha-correta-123' });
    token = resp.body.token;
  });

  async function cadastrarAluno(matricula, turma) {
    await request(app).post('/api/alunos/cadastro').send({
      nome: 'Aluno ' + matricula, idade: 20, matricula, turma, email: `${matricula}@unidavi.edu.br`,
    });
  }

  it('habilitar turma inteira libera acesso para aluno da turma (FR-007, FR-009)', async () => {
    await cadastrarAluno('2026010', 'T33F2');

    const habilitar = await request(app)
      .post('/api/turmas/T33F2/habilitacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ trilha: 'arquitetura' });
    expect(habilitar.status).toBe(200);

    const check = await request(app).get('/api/alunos/2026010/habilitacoes/arquitetura');
    expect(check.body.habilitado).toBe(true);
  });

  it('aluno de outra turma não habilitada continua bloqueado', async () => {
    await cadastrarAluno('2026011', 'T34F2');
    await request(app)
      .post('/api/turmas/T33F2/habilitacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ trilha: 'arquitetura' });

    const check = await request(app).get('/api/alunos/2026011/habilitacoes/arquitetura');
    expect(check.body.habilitado).toBe(false);
  });

  it('exceção individual concedida=false bloqueia aluno mesmo com turma habilitada (US2 cenário 3)', async () => {
    await cadastrarAluno('2026012', 'T33F2');
    await request(app)
      .post('/api/turmas/T33F2/habilitacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ trilha: 'linguagens' });
    await request(app)
      .post('/api/alunos/2026012/habilitacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ trilha: 'linguagens', concedida: false });

    const check = await request(app).get('/api/alunos/2026012/habilitacoes/linguagens');
    expect(check.body.habilitado).toBe(false);
  });

  it('revogar habilitação de turma remove acesso de quem não tem exceção individual', async () => {
    await cadastrarAluno('2026013', 'T33F2');
    await request(app)
      .post('/api/turmas/T33F2/habilitacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ trilha: 'arquitetura' });
    await request(app)
      .delete('/api/turmas/T33F2/habilitacoes/arquitetura')
      .set('Authorization', `Bearer ${token}`);

    const check = await request(app).get('/api/alunos/2026013/habilitacoes/arquitetura');
    expect(check.body.habilitado).toBe(false);
  });

  it('habilitar turma com nome inválido é rejeitado (FR-013)', async () => {
    const resp = await request(app)
      .post('/api/turmas/T99X9/habilitacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ trilha: 'arquitetura' });
    expect(resp.status).toBe(400);
  });
});
