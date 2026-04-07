const { Pool } = require('pg');

// Configuração da conexão com o Neon usando a variável de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function criarBanco() {
  try {
    // 1. Criando a tabela de usuários com o novo campo NOME
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL, 
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      );
    `);

    // 2. Criando a tabela de tarefas (com user_id para cada usuário ter a sua lista)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id SERIAL PRIMARY KEY,
        texto TEXT NOT NULL,
        concluida INTEGER DEFAULT 0,
        user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);
    
    console.log("✅ Tabelas (Usuários com Nome + Tarefas) prontas no Neon!");

    // --- ADAPTADOR SÊNIOR (Traduz o '?' do SQLite para o '$n' do Postgres) ---
    const traduzirSQL = (sql) => {
      let i = 0;
      return sql.replace(/\?/g, () => `$${++i}`);
    };

    return {
      get: (sql, params) => pool.query(traduzirSQL(sql), params).then(res => res.rows[0]),
      all: (sql, params) => pool.query(traduzirSQL(sql), params).then(res => res.rows),
      run: (sql, params) => pool.query(traduzirSQL(sql), params)
    };
  } catch (err) {
    console.error("❌ Erro fatal ao inicializar o banco:", err);
    throw err;
  }
}

module.exports = { criarBanco };