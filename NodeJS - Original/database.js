// database.js atualizado
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function criarBanco() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            texto TEXT,
            concluida INTEGER DEFAULT 0 
        )
    `);

    return db;
}

module.exports = { criarBanco };