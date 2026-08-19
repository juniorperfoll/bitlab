import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { criarApp } from './src/app.js';
import { upsertProfessorCredencial } from './src/db.js';
import { gerarHashSenha } from './src/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'bitlab.db');

const app = criarApp(DB_PATH);

// O tier gratuito do Render não tem disco persistente: o arquivo SQLite (e com
// ele o cadastro de alunos/habilitações) reseta a cada deploy/reinício — limitação
// aceita conscientemente por enquanto (ver research.md #1/#8). Variáveis de
// ambiente configuradas no painel do Render, ao contrário, persistem entre
// deploys — por isso a credencial do professor é reprovisionada a partir delas a
// cada boot, garantindo que o login sobreviva mesmo quando o banco é recriado do
// zero.
if (process.env.ADMIN_USUARIO && process.env.ADMIN_SENHA) {
  const { hash, salt } = gerarHashSenha(process.env.ADMIN_SENHA);
  upsertProfessorCredencial(app.locals.db, process.env.ADMIN_USUARIO, hash, salt);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BitLab rodando em http://localhost:${PORT}`);
});
