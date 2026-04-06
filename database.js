const { Pool } = require('pg');

// O Pool gerencia as conexões automaticamente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function criarBanco() {
  try {
    // Usamos o pool.query diretamente para garantir que a conexão nunca "tranque"
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id SERIAL PRIMARY KEY,
        texto TEXT NOT NULL,
        concluida INTEGER DEFAULT 0,
        user_id INTEGER REFERENCES usuarios(id)
      );
    `);
    
    console.log("✅ Banco PostgreSQL no Neon Conectado e Tabelas Prontas!");

    // Retornamos as funções usando o pool direto. 
    // Ele é inteligente: abre a conexão, faz a busca e libera sozinho.
    return {
      get: (sql, params) => pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params).then(res => res.rows[0]),
      all: (sql, params) => pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params).then(res => res.rows),
      run: (sql, params) => pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params)
    };
  } catch (err) {
    console.error("❌ Erro ao conectar ao banco:", err);
    throw err;
  }
}

module.exports = { criarBanco };