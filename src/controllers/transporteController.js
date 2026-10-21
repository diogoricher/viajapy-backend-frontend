// Datos base de terminales principales y conexiones frecuentes en Paraguay
const terminales = [
  {
    id: 1,
    nombre: 'Terminal de Ómnibus de Asunción (TOA / Estación de Buses de Asunción)',
    ciudad: 'Asunción',
    departamento: 'Capital',
    coordenadas: '-25.3182, -57.6041',
    telefono: '+595 21 551 740',
    descripcion: 'Principal nodo de transporte terrestre nacional e internacional del país.'
  },
  {
    id: 2,
    nombre: 'Terminal de Ómnibus de Ciudad del Este',
    ciudad: 'Ciudad del Este',
    departamento: 'Alto Paraná',
    coordenadas: '-25.5204, -54.6366',
    telefono: '+595 61 512 876',
    descripcion: 'Conexión clave para la Triple Frontera (Paraguay, Brasil y Argentina).'
  },
  {
    id: 3,
    nombre: 'Terminal de Ómnibus de Encarnación',
    ciudad: 'Encarnación',
    departamento: 'Itapúa',
    coordenadas: '-27.3341, -55.8647',
    telefono: '+595 71 202 245',
    descripcion: 'Punto de llegada hacia las Ruinas Jesuíticas, playas y cruce a Posadas.'
  },
  {
    id: 4,
    nombre: 'Terminal de Ómnibus de Villarrica',
    ciudad: 'Villarrica',
    departamento: 'Guairá',
    coordenadas: '-25.7533, -56.4442',
    telefono: '+595 541 42200',
    descripcion: 'Acceso a la cordillera del Ybytyruzú y turismo de naturaleza.'
  },
  {
    id: 5,
    nombre: 'Terminal de Ómnibus de Pedro Juan Caballero',
    ciudad: 'Pedro Juan Caballero',
    departamento: 'Amambay',
    coordenadas: '-22.5447, -55.7289',
    telefono: '+595 336 272 150',
    descripcion: 'Conexión norte con Ponta Porã (Brasil) y Parque Nacional Cerro Corá.'
  }
];

const rutasFrecuentes = [
  {
    origen: 'Asunción',
    destino: 'Ciudad del Este',
    distancia_km: 325,
    tiempo_estimado: '5 a 6 horas',
    precio_estimado_gs: 90000,
    ruta_nacional: 'Ruta PY02',
    empresas_sugeridas: ['Nuestra Señora de la Asunción (NSA)', 'La Santaniana', 'San Luis']
  },
  {
    origen: 'Asunción',
    destino: 'Encarnación',
    distancia_km: 365,
    tiempo_estimado: '6 horas',
    precio_estimado_gs: 100000,
    ruta_nacional: 'Ruta PY01',
    empresas_sugeridas: ['La Encarnacena', 'Rysa', 'Tebicuary']
  },
  {
    origen: 'Asunción',
    destino: 'Villarrica',
    distancia_km: 150,
    tiempo_estimado: '3 a 3.5 horas',
    precio_estimado_gs: 45000,
    ruta_nacional: 'Ruta PY02 y PY08',
    empresas_sugeridas: ['Guaireña', 'La Yuteña']
  },
  {
    origen: 'Ciudad del Este',
    destino: 'Encarnación',
    distancia_km: 280,
    tiempo_estimado: '4 a 5 horas',
    precio_estimado_gs: 75000,
    ruta_nacional: 'Ruta PY06',
    empresas_sugeridas: ['Rysa', 'La Santaniana']
  },
  {
    origen: 'Asunción',
    destino: 'San Pedro / Concepción',
    distancia_km: 410,
    tiempo_estimado: '6 a 7 horas',
    precio_estimado_gs: 110000,
    ruta_nacional: 'Ruta PY03 y PY05',
    empresas_sugeridas: ['Norte Poty', 'La Ovetense']
  }
];

// Obtener listado de terminales de buses
const obtenerTerminales = (req, res) => {
  const { departamento } = req.query;
  if (departamento) {
    const filtradas = terminales.filter(t => 
      t.departamento.toLowerCase().includes(departamento.toLowerCase())
    );
    return res.status(200).json(filtradas);
  }
  return res.status(200).json(terminales);
};

// Obtener rutas sugeridas y tiempos de viaje en bus
const obtenerRutas = (req, res) => {
  const { origen, destino } = req.query;
  let resultado = rutasFrecuentes;

  if (origen) {
    resultado = resultado.filter(r => r.origen.toLowerCase().includes(origen.toLowerCase()));
  }
  if (destino) {
    resultado = resultado.filter(r => r.destino.toLowerCase().includes(destino.toLowerCase()));
  }

  return res.status(200).json(resultado);
};

// Estimar distancia aproximada en línea recta entre dos pares de coordenadas
// Fórmula de Haversine útil para el frontend si necesita calcular distancias locales
const estimarDistancia = (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.query;

    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).json({
        mensaje: 'Debes enviar lat1, lon1, lat2 y lon2 como query params.'
      });
    }

    const toRad = x => (x * Math.PI) / 180;
    const R = 6371; // Radio de la Tierra en km

    const dLat = toRad(Number(lat2) - Number(lat1));
    const dLon = toRad(Number(lon2) - Number(lon1));
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaKm = Math.round(R * c * 10) / 10;

    return res.status(200).json({
      distancia_km: distanciaKm,
      unidad: 'kilómetros',
      tiempo_estimado_auto: `${Math.round((distanciaKm / 80) * 60)} minutos aprox. (80 km/h)`
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al calcular distancia.', error: error.message });
  }
};

module.exports = {
  obtenerTerminales,
  obtenerRutas,
  estimarDistancia
};
