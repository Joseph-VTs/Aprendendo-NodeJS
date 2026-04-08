const express = require('express');
const cors = require('cors');
const { verificarToken, SECRET } = require('./auth.js');
const { criarBanco } = require('./database.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
        // Agora recebemos o NOME também
        const { nome, email, senha } = req.body;
        try {
            const hash = await bcrypt.hash(senha, 10);
            // Inserindo o nome na nova coluna do banco
            await db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hash]);
            res.status(201).json({ mensagem: "Usuário criado!" });
        } catch (erro) {
            res.status(400).json({ erro: "E-mail já cadastrado ou dados inválidos." });
        }
    });

    app.post('/login', async (req, res) => {
        const { email, senha } = req.body;
        const usuario = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);

        // 1. Verifica se o usuário existe
        if (!usuario) {
            return res.status(404).json({ erro: "E-mail não cadastrado." });
        }

        // 2. Verifica se a senha está correta
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha incorreta. Tente novamente." });
        }

        const token = jwt.sign({ userId: usuario.id }, SECRET, { expiresIn: '24h' });
        res.json({ token, nome: usuario.nome });
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

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 API Online na porta ${PORT}`);
    });
}

iniciar();