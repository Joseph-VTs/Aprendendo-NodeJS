// para abrir o banco visualmente: ctrl + shift + p: sqlite open database: selecionar arquivo

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function criarBanco() {
    // Abre (ou cria) o arquivo do banco de dados
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    // Cria a tabela de tarefas se ela não existir
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            texto TEXT
        )
    `);

    return db;
}

module.exports = { criarBanco };