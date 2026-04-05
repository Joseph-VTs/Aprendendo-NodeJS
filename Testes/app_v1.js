const express = require('express');
const cors = require('cors'); // 1. Importa
const { criarBanco } = require('./database.js'); // Importa a função do outro arquivo

// No mundo das APIs, usamos geralmente o método PUT (para atualizar tudo) ou PATCH (para atualizar apenas um pedaço).

const app = express();
app.use(cors());              // 2. Libera o acesso

app.use(express.json());

// Segurança
    const bcrypt = require('bcrypt');

    app.post('/registrar', async (req, res) => {
        const { email, senha } = req.body;

        // 1. Esconde a senha (o número 10 é a força da proteção)
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        try {
            await db.run('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, senhaCriptografada]);
            return res.status(201).json({ mensagem: "Usuário criado!" });
        } catch (erro) {
            return res.status(400).json({ erro: "E-mail já cadastrado" });
        }
    });

    app.get('/tarefas', verificarToken, async (req, res) => {
        // Busca apenas as tarefas QUE PERTENCEM ao usuário logado
        const tarefas = await db.all('SELECT * FROM tarefas WHERE user_id = ?', [req.userId]);
        return res.json(tarefas);
    });
// Fim

// Função principal para rodar o servidor
async function iniciarServidor() {
    // 1. Conecta ao banco de dados antes de tudo
    const db = await criarBanco();

    // 2. Rota para VER as tarefas (Busca do Banco)
    app.get('/tarefas', async (req, res) => {
        const tarefas = await db.all('SELECT * FROM tarefas');
        return res.json(tarefas);
    });

    // 3. Rota para ADICIONAR uma tarefa (Salva no Banco)
    app.post('/tarefas', async (req, res) => {
        const { tarefa } = req.body;
        
        // Comando SQL puro, do jeito que você já conhece!
        await db.run('INSERT INTO tarefas (texto) VALUES (?)', [tarefa]);
        
        return res.status(201).json({ mensagem: "Salvo no banco de dados!" });
    });

    // 4. Rota para DELETAR uma tarefa (DELETE)
    // O ":id" é um espaço reservado para o número da tarefa
    app.delete('/tarefas/:id', async (req, res) => { 
        // app.delete: O método HTTP correto para remoção.
        // :id: Isso é um parâmetro. O Express entende que qualquer coisa que vier depois de /tarefas/ é o ID.

        const idDaTarefa = req.params.id; // Pega o ID que veio na URL
        // req.params: É onde o Node guarda as informações que vêm na "tripa" da URL.

        // Comando SQL para deletar baseado no ID
        const resultado = await db.run('DELETE FROM tarefas WHERE id = ?', [idDaTarefa]);

        // Verificamos se algo realmente foi deletado
        if (resultado.changes === 0) {
            return res.status(404).json({ erro: "Tarefa não encontrada" });
        }

        return res.json({ mensagem: "Tarefa removida com sucesso!" });
    });

    // 5. Rota para EDITAR uma tarefa (PUT)
    app.put('/tarefas/:id', async (req, res) => {
        const { id } = req.params;
        const { texto, concluida } = req.body; // Recebemos o novo texto e o status

        // SQL para atualizar os campos
        await db.run(
            'UPDATE tarefas SET texto = ?, concluida = ? WHERE id = ?',
            [texto, concluida, id]
        );

        return res.json({ mensagem: "Tarefa atualizada com sucesso!" });
    });

    app.listen(3000, () => {
        console.log("Servidor Online com Banco de Dados!");
    });
}

// Chama a função para começar
iniciarServidor();