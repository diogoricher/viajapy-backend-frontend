const db = require('../config/db');

// Registrar que un usuario visitó un lugar
const registrarVisita = async (req, res) => {
    try {
        // Tomamos el usuario_id del token si está autenticado, o del body como compatibilidad
        const usuario_id = req.usuario ? req.usuario.id : req.body.usuario_id;
        const { lugar_id } = req.body;

        if (!usuario_id || !lugar_id) {
            return res.status(400).json({ mensaje: 'usuario_id y lugar_id son obligatorios' });
        }

        // Primero verificamos si el usuario ya visitó este lugar (para no duplicar medallas luego)
        const [existe] = await db.query(
            'SELECT * FROM visitas WHERE usuario_id = ? AND lugar_id = ?', 
            [usuario_id, lugar_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({ mensaje: 'El usuario ya tiene registrada una visita a este lugar' });
        }

        const [result] = await db.query(
            'INSERT INTO visitas (usuario_id, lugar_id) VALUES (?, ?)',
            [usuario_id, lugar_id]
        );

        let medallaDesbloqueada = null;

        // LÓGICA DE GAMIFICACIÓN 1: Medalla "Explorador Novato" (1ra visita)
        const [totalVisitas] = await db.query(
            'SELECT COUNT(*) as total FROM visitas WHERE usuario_id = ?', 
            [usuario_id]
        );

        // Si esta es exactamente su primera visita en total
        if (totalVisitas[0].total === 1) {
            // Le otorgamos la medalla ID 1 ("Explorador Novato")
            await db.query(
                'INSERT INTO usuarios_medallas (usuario_id, medalla_id) VALUES (?, ?)',
                [usuario_id, 1] 
            );
            
            const [medalla] = await db.query('SELECT nombre FROM medallas WHERE id = 1');
            if(medalla.length > 0) medallaDesbloqueada = medalla[0].nombre;
        }

        // LÓGICA DE GAMIFICACIÓN 2: Medalla "Aventurero del Sur" (3 visitas en Itapúa)
        const [visitasItapua] = await db.query(`
            SELECT COUNT(*) as total 
            FROM visitas v
            JOIN lugares l ON v.lugar_id = l.id
            WHERE v.usuario_id = ? AND l.departamento = 'Itapúa'
        `, [usuario_id]);

        if (visitasItapua[0].total === 3) {
            // Verificamos que no la tenga ya
            const [yaTieneMedalla2] = await db.query(
                'SELECT * FROM usuarios_medallas WHERE usuario_id = ? AND medalla_id = 2', 
                [usuario_id]
            );
            if (yaTieneMedalla2.length === 0) {
                await db.query(
                    'INSERT INTO usuarios_medallas (usuario_id, medalla_id) VALUES (?, ?)',
                    [usuario_id, 2] 
                );
                const [medalla2] = await db.query('SELECT nombre FROM medallas WHERE id = 2');
                if(medallaDesbloqueada) {
                    medallaDesbloqueada += ' y ' + medalla2[0].nombre;
                } else {
                    medallaDesbloqueada = medalla2[0].nombre;
                }
            }
        }

        let mensajeExito = 'Visita registrada con éxito.';
        if (medallaDesbloqueada) {
            mensajeExito += ` 🎉 ¡NUEVA MEDALLA DESBLOQUEADA: ${medallaDesbloqueada}!`;
        }

        res.status(201).json({
            mensaje: mensajeExito,
            id: result.insertId,
            medalla_desbloqueada: medallaDesbloqueada !== null
        });
    } catch (error) {
        console.error('Error en registrarVisita:', error);
        res.status(500).json({ mensaje: 'Error al registrar la visita' });
    }
};

// Obtener todas las visitas de un usuario específico (Ideal para el mapa coloreado)
const obtenerVisitasPorUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        // Aquí usamos un JOIN de SQL para traer los datos de la visita Y el nombre/coordenadas del lugar
        const query = `
            SELECT v.id AS visita_id, v.fecha_visita, 
                   l.id AS lugar_id, l.nombre, l.departamento, l.coordenadas 
            FROM visitas v
            JOIN lugares l ON v.lugar_id = l.id
            WHERE v.usuario_id = ?
            ORDER BY v.fecha_visita DESC
        `;
        
        const [rows] = await db.query(query, [usuario_id]);

        res.json({
            mensaje: 'Historial de visitas obtenido',
            total_visitas: rows.length,
            datos: rows
        });
    } catch (error) {
        console.error('Error en obtenerVisitasPorUsuario:', error);
        res.status(500).json({ mensaje: 'Error al obtener las visitas' });
    }
};

module.exports = {
    registrarVisita,
    obtenerVisitasPorUsuario
};
