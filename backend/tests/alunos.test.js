import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { criarAppDeTeste, seedProfessor } from './setup.js';

describe('alunos', () => {
  let app;

  beforeEach(() => {
    app = criarAppDeTeste();
    seedProfessor(app, 'ademar', 'senha-correta-123');
  });

  async function login() {
    const resp = await request(app)
      .post('/api/login')
      .send({ usuario: 'ademar', senha: 'senha-correta-123' });
    return resp.body.token;
  }

  it('rejeita cadastro com e-mail fora do domínio institucional (FR-016)', async () => {
    const resp = await request(app).post('/api/alunos/cadastro').send({
      nome: 'Aluno Teste', idade: 20, matricula: '2026001', turma: 'T33F2', email: 'aluno@gmail.com',
    });
    expect(resp.status).toBe(400);
    expect(resp.body.mensagem).toContain('unidavi.edu.br');
  });

  it('rejeita cadastro com turma inválida (FR-013)', async () => {
    const resp = await request(app).post('/api/alunos/cadastro').send({
      nome: 'Aluno Teste', idade: 20, matricula: '2026002', turma: 'T99X9', email: 'aluno@unidavi.edu.br',
    });
    expect(resp.status).toBe(400);
  });

  it('cadastro válido cria o aluno; matrícula repetida atualiza em vez de duplicar', async () => {
    const dadosIniciais = {
      nome: 'Aluno Um', idade: 19, matricula: '2026003', turma: 'T33F2', email: 'aluno1@unidavi.edu.br',
    };
    const resp1 = await request(app).post('/api/alunos/cadastro').send(dadosIniciais);
    expect(resp1.status).toBe(200);

    const dadosAtualizados = { ...dadosIniciais, nome: 'Aluno Um Atualizado', idade: 20 };
    const resp2 = await request(app).post('/api/alunos/cadastro').send(dadosAtualizados);
    expect(resp2.status).toBe(200);

    const token = await login();
    const listaResp = await request(app).get('/api/alunos').set('Authorization', `Bearer ${token}`);
    expect(listaResp.body.alunos).toHaveLength(1);
    expect(listaResp.body.alunos[0].nome).toBe('Aluno Um Atualizado');
  });

  it('GET /api/alunos exige autenticação', async () => {
    const resp = await request(app).get('/api/alunos');
    expect(resp.status).toBe(401);
  });
});
