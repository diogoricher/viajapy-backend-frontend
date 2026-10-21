const express = require('express');
const router = express.Router();
const itinerariosController = require('../controllers/itinerariosController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta POST para generar un itinerario personalizado con IA
router.post('/generar', itinerariosController.generarItinerario);

// Rutas protegidas para guardar y gestionar itinerarios del usuario
router.post('/guardar', verificarToken, itinerariosController.guardarItinerario);
router.get('/mis-itinerarios', verificarToken, itinerariosController.misItinerarios);
router.delete('/:id', verificarToken, itinerariosController.eliminarItinerario);

module.exports = router;
