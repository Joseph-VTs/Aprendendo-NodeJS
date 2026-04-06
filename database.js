const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function criarBanco() {
  // 1. Criamos as tabelas usando o pool diretamente (mais seguro)
  try {
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
    
    console.log("✅ Tabelas verificadas/criadas no Neon!");

    // 2. Retornamos as funções usando pool.query para que a conexão nunca "feche"
    return {
      get: (sql, params) => pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params).then(res => res.rows[0]),
      all: (sql, params) => pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params).then(res => res.rows),
      run: (sql, params) => pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params)
    };
  } catch (err) {
    console.error("❌ Erro ao inicializar o banco:", err);
    throw err;
  }
}

module.exports = { criarBanco };