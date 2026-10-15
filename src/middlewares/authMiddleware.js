const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Obtenemos el token de las cabeceras (headers) de la petición
    // Normalmente viene en el formato: "Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token válido.' });
    }

    // 2. Extraemos solo el token (quitamos la palabra "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verificamos que el token sea válido y no haya expirado
        // Debemos usar la misma clave secreta que usamos en el login
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_clave_secreta_viajapy_123');
        
        // 4. Guardamos los datos del usuario en req.usuario para que el controlador pueda usarlos
        req.usuario = decoded;
        
        // 5. Permitimos que la petición continúe (pasamos al controlador)
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
};

const verificarAdmin = (req, res, next) => {
    // Este middleware siempre debe ir DESPUÉS de verificarToken
    // Así ya tendremos los datos del usuario en req.usuario
    if (req.usuario && req.usuario.rol === 'admin') {
        next(); // Es admin, lo dejamos pasar
    } else {
        return res.status(403).json({ mensaje: 'Acceso denegado. Requiere permisos de administrador.' });
    }
};

module.exports = {
    verificarToken,
    verificarAdmin
};
