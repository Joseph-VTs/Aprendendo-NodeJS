// No mundo das APIs, usamos geralmente o método PUT (para atualizar tudo) ou PATCH (para atualizar apenas um pedaço).

const express = require('express');
const { criarBanco } = require('./database.js'); // Importa a função do outro arquivo

const app = express();
app.use(express.json());

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