const express = require('express');
const router = express.Router();
const itinerariosController = require('../controllers/itinerariosController');

// Ruta POST para generar un itinerario personalizado con IA
router.post('/generar', itinerariosController.generarItinerario);

module.exports = router;
