const express = require('express');
const cors = require('cors');
const { verificarToken, SECRET } = require('./auth.js');
const { criarBanco } = require('./database.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Carrega .env apenas se não estiver em produção
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('🚀 A API está viva e funcionando no Render!');
});

async function iniciar() {
    const db = await criarBanco();

    // --- ROTAS PÚBLICAS ---
    app.post('/registrar', async (req, res) => {
        const { email, senha } = req.body;
        try {
            const hash = await bcrypt.hash(senha, 10);
            await db.run('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, hash]);
            res.status(201).json({ mensagem: "Usuário criado!" });
        } catch (erro) {
            res.status(400).json({ erro: "E-mail já cadastrado." });
        }
    });

    app.post('/login', async (req, res) => {
        const { email, senha } = req.body;
        const usuario = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(401).json({ erro: "Dados incorretos." });
        }
        const token = jwt.sign({ userId: usuario.id }, SECRET, { expiresIn: '2h' });
        res.json({ token });
    });

    // --- ROTAS PROTEGIDAS ---
    app.get('/tarefas', verificarToken, async (req, res) => {
        const tarefas = await db.all('SELECT * FROM tarefas WHERE user_id = ?', [req.userId]);
        res.json(tarefas);
    });

    app.post('/tarefas', verificarToken, async (req, res) => {
        const { tarefa } = req.body;
        await db.run('INSERT INTO tarefas (texto, user_id) VALUES (?, ?)', [tarefa, req.userId]);
        res.status(201).send();
    });

    app.put('/tarefas/:id', verificarToken, async (req, res) => {
        const { id } = req.params;
        const { texto, concluida } = req.body;
        await db.run('UPDATE tarefas SET texto = ?, concluida = ? WHERE id = ? AND user_id = ?', [texto, concluida, id, req.userId]);
        res.json({ mensagem: "Atualizado!" });
    });

    app.delete('/tarefas/:id', verificarToken, async (req, res) => {
        const { id } = req.params;
        await db.run('DELETE FROM tarefas WHERE id = ? AND user_id = ?', [id, req.userId]);
        res.json({ mensagem: "Excluído!" });
    });

    // Porta dinâmica para o Render (0.0.0.0 é obrigatório para ser acessível externamente)
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 API Online na porta ${PORT}`);
    });
}

iniciar();