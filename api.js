import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚨 IMPORTANTE: Substitua pela URL que o Render vai te dar (ex: https://meu-todo.onrender.com)
const BASE_URL = 'https://meu-backend-todo.onrender.com/'; 

const obterHeaders = async () => {
    // No celular o acesso ao crachá (token) é assíncrono
    const token = await AsyncStorage.getItem('token'); 
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- AUTENTICAÇÃO ---
export async function fazerLogin(email, senha) {
    return await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
}

export async function cadastrarUsuario(email, senha) {
    return await fetch(`${BASE_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
}

// --- TAREFAS (CRUD PROFISSIONAL) ---
export async function buscarTarefas() {
    const headers = await obterHeaders();
    const resposta = await fetch(`${BASE_URL}/tarefas`, { headers });
    if (resposta.status === 401) throw new Error("Sessão expirada");
    return await resposta.json();
}

export async function salvarTarefa(texto) {
    const headers = await obterHeaders();
    await fetch(`${BASE_URL}/tarefas`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ tarefa: texto })
    });
}

export async function excluirTarefa(id) {
    const headers = await obterHeaders();
    await fetch(`${BASE_URL}/tarefas/${id}`, {
        method: 'DELETE',
        headers: headers
    });
}

export async function atualizarTarefa(id, texto, concluida) {
    const headers = await obterHeaders();
    await fetch(`${BASE_URL}/tarefas/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ texto, concluida })
    });
}