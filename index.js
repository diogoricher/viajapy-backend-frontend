require('dotenv').config();
const express = require('express');
const db = require('./src/config/db');

// Importamos nuestros archivos de rutas
const lugaresRoutes = require('./src/routes/lugaresRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const visitasRoutes = require('./src/routes/visitasRoutes');
const itinerariosRoutes = require('./src/routes/itinerariosRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Conectamos las rutas a la API
app.use('/api/lugares', lugaresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/visitas', visitasRoutes);
app.use('/api/itinerarios', itinerariosRoutes);

// Ruta principal de prueba
app.get('/', (req, res) => {
  res.send('¡Bienvenido al backend de ViajaPy! La API está funcionando.');
});

app.listen(port, () => {
  console.log(`🚀 Servidor de ViajaPy ejecutándose en http://localhost:${port}`);
});
