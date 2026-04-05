/*  🧱 Por que separar assim?

- Reutilização: Se amanhã você criar uma página de "Relatórios", você só importa o api.js lá e já tem todas as funções prontas.
- Manutenção: Se a URL do servidor mudar, você só mexe em um lugar (api.js) e não em todos os arquivos do projeto.
- Organização Sênior: Separar a Lógica de Dados (api.js) da Lógica de Interface (script.js) é o primeiro passo para aprender frameworks como React ou Vue.

*/

// api.js - Central de Comunicação com o Servidor
const BASE_URL = 'http://localhost:3000';

// 🛡️ Função auxiliar para buscar o "crachá" (Token) no navegador
const obterHeaders = () => {
    const token = localStorage.getItem('token'); 
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- FUNÇÕES DE AUTENTICAÇÃO ---

export async function fazerLogin(email, senha) {
    const resposta = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    return resposta; // Retornamos a resposta pura para tratar o erro ou o token no script.js
}

export async function cadastrarUsuario(email, senha) {
    const resposta = await fetch(`${BASE_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    return resposta;
}

// --- FUNÇÕES DE TAREFAS (PROTEGIDAS) ---

export async function buscarTarefas() {
    const resposta = await fetch(`${BASE_URL}/tarefas`, { 
        headers: obterHeaders() 
    });
    
    if (resposta.status === 401) {
        throw new Error("Sessão expirada");
    }
    return await resposta.json();
}

export async function salvarTarefa(texto) {
    await fetch(`${BASE_URL}/tarefas`, {
        method: 'POST',
        headers: obterHeaders(),
        body: JSON.stringify({ tarefa: texto })
    });
}

export async function excluirTarefa(id) {
    await fetch(`${BASE_URL}/tarefas/${id}`, {
        method: 'DELETE',
        headers: obterHeaders()
    });
}

export async function atualizarTarefa(id, texto, concluida) {
    await fetch(`${BASE_URL}/tarefas/${id}`, {
        method: 'PUT',
        headers: obterHeaders(),
        body: JSON.stringify({ texto, concluida })
    });
}