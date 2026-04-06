const jwt = require('jsonwebtoken');

// No Render, você vai cadastrar uma variável chamada SECRET
const SECRET = process.env.SECRET || 'chave_mestra_segura_local';

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ erro: "Token expirado ou inválido." });
        req.userId = decoded.userId;
        next();
    });
}

module.exports = { verificarToken, SECRET };