const express = require('express');
const router = express.Router();
const transporteController = require('../controllers/transporteController');

// Obtener terminales de buses (admite ?departamento=...)
router.get('/terminales', transporteController.obtenerTerminales);

// Obtener rutas y tiempos de viaje (admite ?origen=...&destino=...)
router.get('/rutas', transporteController.obtenerRutas);

// Calculadora de distancia entre dos coordenadas (?lat1=&lon1=&lat2=&lon2=)
router.get('/distancia', transporteController.estimarDistancia);

module.exports = router;
