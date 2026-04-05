// script.js - Organizado e sem duplicidade
import { buscarTarefas, salvarTarefa, excluirTarefa } from '../api.js';

const listaUL = document.getElementById('lista');
const input = document.getElementById('inputTarefa');
const btnAdicionar = document.getElementById('btnAdicionar');

// Função para desenhar a lista na tela
async function renderizar() {
    const tarefas = await buscarTarefas();
    listaUL.innerHTML = '';

    tarefas.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${t.texto}</span>
            <button class="btn-delete" data-id="${t.id}">❌</button>
        `;
        listaUL.appendChild(li);
    });

    // Evento nos botões de deletar
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = async () => {
            await excluirTarefa(btn.dataset.id);
            renderizar();
        };
    });
}

// ÚNICA forma de adicionar (moderna)
btnAdicionar.addEventListener('click', async () => {
    const valor = input.value.trim();
    
    if (valor !== '') {
        await salvarTarefa(valor);
        input.value = ''; // Limpa o campo
        renderizar();     // Atualiza a lista
    } else {
        alert("Digite algo na tarefa!");
    }
});

// Carrega a lista assim que a página abre
renderizar();