require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');

// Importamos nuestros archivos de rutas
const lugaresRoutes = require('./src/routes/lugaresRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const visitasRoutes = require('./src/routes/visitasRoutes');
const itinerariosRoutes = require('./src/routes/itinerariosRoutes');
const transporteRoutes = require('./src/routes/transporteRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir frontend estático de forma integrada
const path = require('path');
const frontendPath = path.join(__dirname, 'viaja-py-frontend', 'viajapy-main');
app.use(express.static(frontendPath));

// Conectamos las rutas a la API
app.use('/api/lugares', lugaresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/visitas', visitasRoutes);
app.use('/api/itinerarios', itinerariosRoutes);
app.use('/api/transporte', transporteRoutes);

// Ruta de estado de la API
app.get('/api/health', (req, res) => {
  res.json({
    mensaje: '¡Bienvenido al backend de ViajaPy! La API está funcionando.',
    version: '1.0.0',
    modulos: [
      '/api/lugares',
      '/api/usuarios',
      '/api/visitas',
      '/api/itinerarios',
      '/api/transporte'
    ]
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor de ViajaPy ejecutándose en http://localhost:${port}`);
});
