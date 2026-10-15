const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        // Obtenemos los usuarios, pero sin enviar la contraseña por seguridad
        const [rows] = await db.query('SELECT id, nombre, email, creado_en FROM usuarios');
        res.json({
            mensaje: 'Lista de usuarios obtenida con éxito',
            datos: rows
        });
    } catch (error) {
        console.error('Error en obtenerUsuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
};

// Crear un nuevo usuario (Registro)
const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validación básica
        if (!nombre || !email || !password) {
            return res.status(400).json({ mensaje: 'Nombre, email y password son obligatorios' });
        }

        // TODO: Encriptar la contraseña antes de guardarla (lo implementaremos después)
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptado = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, passwordEncriptado]
        );

        res.status(201).json({
            mensaje: 'Usuario creado con éxito',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error en crearUsuario:', error);
        // Manejamos el error si el email ya existe en la base de datos (codigo 1062 en MySQL)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensaje: 'Este email ya está registrado' });
        }
        res.status(500).json({ mensaje: 'Error al crear el usuario' });
    }
};

// Iniciar sesión (Login)
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verificamos que envíen email y password
        if (!email || !password) {
            return res.status(400).json({ mensaje: 'Email y password son obligatorios' });
        }

        // 2. Buscamos el usuario por su email en la base de datos
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (usuarios.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = usuarios[0];

        // 3. Comparamos la contraseña enviada con la contraseña encriptada en la BD
        const esPasswordValido = await bcrypt.compare(password, usuario.password);

        if (!esPasswordValido) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        // 4. Si todo es correcto, generamos el Token (JWT)
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol }, 
            process.env.JWT_SECRET || 'mi_clave_secreta_viajapy_123', 
            { expiresIn: '24h' }
        );

        // 5. Respondemos enviando el token al frontend
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en loginUsuario:', error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    loginUsuario
};
