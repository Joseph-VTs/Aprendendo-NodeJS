const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function criarBanco() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, senha TEXT NOT NULL);`);
    await pool.query(`CREATE TABLE IF NOT EXISTS tarefas (id SERIAL PRIMARY KEY, texto TEXT NOT NULL, concluida INTEGER DEFAULT 0, user_id INTEGER REFERENCES usuarios(id));`);
    
    console.log("✅ Tabelas prontas no Neon!");

    // FUNÇÃO AUXILIAR DE TRADUÇÃO (O segredo do Arquiteto)
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
    console.error("❌ Erro no banco:", err);
    throw err;
  }
}

module.exports = { criarBanco };