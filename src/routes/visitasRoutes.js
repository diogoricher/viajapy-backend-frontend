const express = require('express');
const router = express.Router();
const visitasController = require('../controllers/visitasController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta para registrar una nueva visita (protegida con token)
router.post('/', verificarToken, visitasController.registrarVisita);

// Ruta para ver los lugares que visitó un usuario en particular (GET /api/visitas/usuario/1)
router.get('/usuario/:usuario_id', visitasController.obtenerVisitasPorUsuario);

// Ruta para obtener las medallas desbloqueadas de un usuario (GET /api/visitas/medallas/:usuario_id)
router.get('/medallas/:usuario_id', visitasController.obtenerMedallasPorUsuario);

module.exports = router;
