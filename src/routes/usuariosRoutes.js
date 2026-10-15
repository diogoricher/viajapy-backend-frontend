const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Ruta para obtener todos los usuarios (GET /api/usuarios)
router.get('/', usuariosController.obtenerUsuarios);

// Ruta para crear un nuevo usuario (POST /api/usuarios)
router.post('/', usuariosController.crearUsuario);

// Ruta para iniciar sesión (POST /api/usuarios/login)
router.post('/login', usuariosController.loginUsuario);

module.exports = router;
