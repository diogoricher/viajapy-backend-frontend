const db = require('../config/db');
const { GoogleGenAI } = require('@google/genai');

// Función controladora para generar un itinerario personalizado
const generarItinerario = async (req, res) => {
  try {
    const { dias, intereses, departamento, presupuesto } = req.body;

    // Validación básica de entrada
    if (!dias) {
      return res.status(400).json({
        mensaje: 'El campo "dias" es obligatorio (ej: 2).'
      });
    }

    // 1. Consultar lugares turísticos reales desde nuestra base de datos MySQL
    let query = 'SELECT id, nombre, descripcion, departamento, coordenadas, horario, precio FROM lugares';
    let params = [];

    // Si el usuario especificó un departamento, filtramos por él; si no, traemos los lugares disponibles
    if (departamento) {
      query += ' WHERE departamento LIKE ?';
      params.push(`%${departamento}%`);
    }

    const [lugaresBD] = await db.query(query, params);

    // 2. Preparar el contexto de lugares para la IA
    const contextoLugares = lugaresBD.map(lugar => {
      return `- ${lugar.nombre} (${lugar.departamento}): ${lugar.descripcion}. Horario: ${lugar.horario || 'No especificado'}, Precio: ${lugar.precio ? lugar.precio + ' Gs.' : 'Gratuito/No especificado'}. Coordenadas: ${lugar.coordenadas || 'N/A'}`;
    }).join('\n');

    // 3. Inicializar el cliente de Google Gen AI con la clave de entorno
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 4. Crear el prompt estructurado para Gemini
    const prompt = `
Eres un guía turístico experto en Paraguay para la plataforma "ViajaPy".
Tu objetivo es armar un itinerario de viaje atractivo, realista y personalizado.

DATOS DEL VIAJERO:
- Días disponibles: ${dias} día(s).
- Intereses/Preferencias: ${intereses || 'Turismo general, naturaleza y cultura'}.
- Departamento o zona preferida: ${departamento || 'Cualquier zona de Paraguay recomendada'}.
- Presupuesto estimado: ${presupuesto || 'Estándar'}.

LUGARES DISPONIBLES EN NUESTRA BASE DE DATOS:
${contextoLugares || 'No hay lugares específicos cargados para este filtro, sugiere atracciones destacadas de Paraguay.'}

INSTRUCCIONES OBLIGATORIAS:
1. Prioriza incluir los lugares disponibles en nuestra base de datos si encajan con el plan.
2. Organiza el itinerario día por día, con actividades sugeridas para la mañana, tarde y noche.
3. Incluye recomendaciones de gastronomía típica paraguaya (ej: chipa, sopa paraguaya, mbeju) y consejos útiles de transporte o seguridad.
4. Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura exacta, sin texto adicional ni bloques markdown fuera del JSON:

{
  "titulo": "Título atractivo del viaje",
  "resumen": "Breve descripción general de la experiencia",
  "dias": [
    {
      "dia": 1,
      "titulo_dia": "Resumen del día 1",
      "actividades": [
        {
          "momento": "Mañana | Tarde | Noche",
          "lugar": "Nombre del lugar",
          "descripcion": "Qué hacer y recomendaciones",
          "precio_estimado": "Costo estimado en Gs."
        }
      ],
      "recomendacion_gastronomica": "Plato típico o sugerencia para comer"
    }
  ],
  "consejos": [
    "Consejo de viaje o transporte útil"
  ]
}
`;

    // 5. Llamar al modelo de Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    // 6. Parsear y responder con el itinerario generado
    const itinerarioJSON = JSON.parse(response.text);

    return res.status(200).json({
      exito: true,
      itinerario: itinerarioJSON
    });

  } catch (error) {
    console.error('Error al generar el itinerario:', error);
    return res.status(500).json({
      mensaje: 'Ocurrió un error al generar el itinerario con IA.',
      error: error.message
    });
  }
};

// Guardar un itinerario para el usuario autenticado
const guardarItinerario = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { titulo, resumen, departamento, dias, detalle } = req.body;

    if (!titulo || !detalle) {
      return res.status(400).json({
        mensaje: 'Los campos "titulo" y "detalle" son obligatorios.'
      });
    }

    const detalleJSON = typeof detalle === 'object' ? JSON.stringify(detalle) : detalle;

    const [resultado] = await db.query(
      'INSERT INTO itinerarios (usuario_id, titulo, resumen, departamento, dias, detalle) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario_id, titulo, resumen || '', departamento || null, dias || 1, detalleJSON]
    );

    return res.status(201).json({
      mensaje: 'Itinerario guardado exitosamente.',
      itinerario_id: resultado.insertId
    });
  } catch (error) {
    console.error('Error al guardar itinerario:', error);
    return res.status(500).json({
      mensaje: 'Error al guardar el itinerario.',
      error: error.message
    });
  }
};

// Obtener los itinerarios guardados del usuario autenticado
const misItinerarios = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const [itinerarios] = await db.query(
      'SELECT id, titulo, resumen, departamento, dias, detalle, fecha_creacion FROM itinerarios WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [usuario_id]
    );

    // Parseamos el JSON para entregarlo ya estructurado
    const formateados = itinerarios.map(it => {
      let parsedDetalle = it.detalle;
      if (typeof it.detalle === 'string') {
        try {
          parsedDetalle = JSON.parse(it.detalle);
        } catch (e) {
          parsedDetalle = it.detalle;
        }
      }
      return {
        ...it,
        detalle: parsedDetalle
      };
    });

    return res.status(200).json(formateados);
  } catch (error) {
    console.error('Error al obtener itinerarios:', error);
    return res.status(500).json({
      mensaje: 'Error al consultar los itinerarios.',
      error: error.message
    });
  }
};

// Eliminar un itinerario guardado del usuario
const eliminarItinerario = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { id } = req.params;

    const [resultado] = await db.query(
      'DELETE FROM itinerarios WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Itinerario no encontrado o no autorizado para eliminarlo.'
      });
    }

    return res.status(200).json({
      mensaje: 'Itinerario eliminado correctamente.'
    });
  } catch (error) {
    console.error('Error al eliminar itinerario:', error);
    return res.status(500).json({
      mensaje: 'Error al eliminar el itinerario.',
      error: error.message
    });
  }
};

module.exports = {
  generarItinerario,
  guardarItinerario,
  misItinerarios,
  eliminarItinerario
};
