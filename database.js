const { Pool } = require('pg');

// O Pool gerencia a conexão com o Neon.tech via variável de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obrigatório para bancos na nuvem
  }
});

async function criarBanco() {
  const client = await pool.connect();
  try {
    // Criando Tabelas no Padrão Postgres
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id SERIAL PRIMARY KEY,
        texto TEXT NOT NULL,
        concluida INTEGER DEFAULT 0,
        user_id INTEGER REFERENCES usuarios(id)
      );
    `);
    
    console.log("✅ Banco PostgreSQL no Neon Conectado!");

    // Adaptador Sênior: converte o padrão "?" do SQLite para "$1, $2" do Postgres
    // Isso evita que você tenha que reescrever todas as rotas no app.js
    return {
      get: (sql, params) => client.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params).then(res => res.rows[0]),
      all: (sql, params) => client.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params).then(res => res.rows),
      run: (sql, params) => client.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params)
    };
  } finally {
    client.release();
  }
}

module.exports = { criarBanco };