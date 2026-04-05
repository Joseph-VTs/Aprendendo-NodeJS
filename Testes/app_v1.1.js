const express = require('express');
const cors = require('cors'); // NÃO ESQUEÇA: npm install cors
const { verificarToken, SECRET } = require('./auth.js');
const { criarBanco } = require('./database.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors()); // Libera o acesso para o seu index.html

async function iniciar() {
    const db = await criarBanco();

    // --- ROTAS PÚBLICAS ---
    app.post('/registrar', async (req, res) => {
        const { email, senha } = req.body;
        try {
            const senhaCriptografada = await bcrypt.hash(senha, 10);
            await db.run('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, senhaCriptografada]);
            res.status(201).json({ mensagem: "Usuário criado!" });
        } catch (erro) {
            res.status(400).json({ erro: "E-mail já cadastrado" });
        }
    });

    app.post('/login', async (req, res) => {
        const { email, senha } = req.body;
        const usuario = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(401).json({ erro: "Dados inválidos" });
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

    // Adicione as rotas de DELETE e PUT aqui também, sempre com o verificarToken e filtrando por user_id!

    app.listen(3000, () => console.log("🚀 Servidor Seguro Rodando em http://localhost:3000"));
}

iniciar();