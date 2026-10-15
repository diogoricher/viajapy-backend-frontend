const express = require('express');
const router = express.Router();
const lugaresController = require('../controllers/lugaresController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

// Definimos que cuando se haga una petición GET a esta ruta, 
// se ejecute la función obtenerLugares del controlador.
router.get('/', lugaresController.obtenerLugares);

// Ruta para obtener un lugar específico por su ID
router.get('/:id', lugaresController.obtenerLugarPorId);

// Ruta para crear un nuevo lugar turístico
router.post('/', verificarToken, verificarAdmin, lugaresController.crearLugar);

// Ruta para actualizar un lugar por su ID
router.put('/:id', verificarToken, verificarAdmin, lugaresController.actualizarLugar);

// Ruta para eliminar un lugar por su ID
router.delete('/:id', verificarToken, verificarAdmin, lugaresController.eliminarLugar);

module.exports = router;
