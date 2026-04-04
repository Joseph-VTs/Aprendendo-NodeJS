// GET - Buscar | POST Criar


// 1. Chamamos o Express para o jogo
const express = require('express');
const app = express();

// 2. Dizemos ao Express para conseguir ler textos em formato JSON
app.use(express.json());

// 3. Criamos a nossa lista de tarefas (por enquanto, apenas na memória)
let listaDeTarefas = ["Estudar Nodejs", "Fazer café", "Estudar ADS"];

// 4. Rota para VER as tarefas (GET)
app.get('/tarefas', (req, res) => {
    return res.json(listaDeTarefas);
});

// Incrementação
// Rota para ADICIONAR uma tarefa (POST)
app.post('/tarefas', (req, res) => {
    const novaTarefa = req.body.tarefa; // Pega o que você enviou
    listaDeTarefas.push(novaTarefa);    // Coloca na lista
    
    return res.json({ mensagem: "Tarefa adicionada!", listaAtual: listaDeTarefas });
});

// 5. Ligamos o servidor na porta 3000
app.listen(3000, () => {
    console.log("Servidor rodando! Acesse http://localhost:3000/tarefas");
});