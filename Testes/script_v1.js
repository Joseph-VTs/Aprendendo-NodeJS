const URL_API = 'http://localhost:3000/tarefas';

// 1. Função para BUSCAR as tarefas do banco
async function carregarTarefas() {
    const resposta = await fetch(URL_API);
    const tarefas = await resposta.json();

    const listaUL = document.getElementById('lista');
    listaUL.innerHTML = ''; // Limpa a lista antes de mostrar

    tarefas.forEach(t => {
        listaUL.innerHTML += `
            <li>
                ${t.texto} 
                <button onclick="deletarTarefa(${t.id})">❌</button>
            </li>
        `;
    });
}

// 2. Função para ENVIAR uma nova tarefa
async function adicionarTarefa() {
    const input = document.getElementById('inputTarefa');
    
    await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarefa: input.value })
    });

    input.value = ''; // Limpa o campo
    carregarTarefas(); // Atualiza a lista na tela
}

// 3. Função para DELETAR
async function deletarTarefa(id) {
    await fetch(`${URL_API}/${id}`, { method: 'DELETE' });
    carregarTarefas();
}

// Começa carregando as tarefas
carregarTarefas();