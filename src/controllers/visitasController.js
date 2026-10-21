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

        let medallaDesbloqueada = [];

        // Helper para asignar medalla si no la tiene
        const asignarMedalla = async (medallaId) => {
            const [yaTiene] = await db.query(
                'SELECT * FROM usuarios_medallas WHERE usuario_id = ? AND medalla_id = ?',
                [usuario_id, medallaId]
            );
            if (yaTiene.length === 0) {
                await db.query(
                    'INSERT INTO usuarios_medallas (usuario_id, medalla_id) VALUES (?, ?)',
                    [usuario_id, medallaId]
                );
                const [m] = await db.query('SELECT nombre FROM medallas WHERE id = ?', [medallaId]);
                if (m.length > 0) medallaDesbloqueada.push(m[0].nombre);
            }
        };

        // LÓGICA DE GAMIFICACIÓN 1: Medalla "Explorador Novato" (1ra visita)
        const [totalVisitas] = await db.query(
            'SELECT COUNT(*) as total FROM visitas WHERE usuario_id = ?', 
            [usuario_id]
        );
        const total = totalVisitas[0].total;

        if (total === 1) {
            await asignarMedalla(1); // Explorador Novato
        }

        // LÓGICA DE GAMIFICACIÓN 2: Medalla "Aventurero del Sur" (3 visitas en Itapúa)
        const [visitasItapua] = await db.query(`
            SELECT COUNT(*) as total 
            FROM visitas v
            JOIN lugares l ON v.lugar_id = l.id
            WHERE v.usuario_id = ? AND l.departamento = 'Itapúa'
        `, [usuario_id]);

        if (visitasItapua[0].total >= 3) {
            await asignarMedalla(2); // Aventurero del Sur
        }

        // LÓGICA DE GAMIFICACIÓN 3: Medalla "Maestro de las Cascadas" (2 o más saltos/cascadas)
        const [visitasSaltos] = await db.query(`
            SELECT COUNT(*) as total
            FROM visitas v
            JOIN lugares l ON v.lugar_id = l.id
            WHERE v.usuario_id = ? AND (l.nombre LIKE '%Salto%' OR l.nombre LIKE '%Cascada%')
        `, [usuario_id]);

        if (visitasSaltos[0].total >= 2) {
            await asignarMedalla(3); // Maestro de las Cascadas
        }

        // LÓGICA DE GAMIFICACIÓN 4: Medalla "Conquistador de Cimas" (Cerros)
        const [visitasCerros] = await db.query(`
            SELECT COUNT(*) as total
            FROM visitas v
            JOIN lugares l ON v.lugar_id = l.id
            WHERE v.usuario_id = ? AND l.nombre LIKE '%Cerro%'
        `, [usuario_id]);

        if (visitasCerros[0].total >= 2) {
            await asignarMedalla(4); // Conquistador de Cimas
        }

        // LÓGICA DE GAMIFICACIÓN 5: Medalla "Guardián del Chaco"
        const [visitasChaco] = await db.query(`
            SELECT COUNT(*) as total
            FROM visitas v
            JOIN lugares l ON v.lugar_id = l.id
            WHERE v.usuario_id = ? AND (l.departamento = 'Boquerón' OR l.departamento = 'Alto Paraguay' OR l.departamento = 'Presidente Hayes' OR l.nombre LIKE '%Chaco%')
        `, [usuario_id]);

        if (visitasChaco[0].total >= 1) {
            await asignarMedalla(5); // Guardián del Chaco
        }

        // LÓGICA DE GAMIFICACIÓN 6: Medalla "Gran Explorador de Paraguay" (5 o más visitas en total)
        if (total >= 5) {
            await asignarMedalla(7); // Gran Explorador de Paraguay
        }

        let mensajeExito = 'Visita registrada con éxito.';
        if (medallaDesbloqueada.length > 0) {
            mensajeExito += ` 🎉 ¡NUEVA MEDALLA DESBLOQUEADA: ${medallaDesbloqueada.join(' y ')}!`;
        }

        res.status(201).json({
            mensaje: mensajeExito,
            id: result.insertId,
            medalla_desbloqueada: medallaDesbloqueada.length > 0
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

// Obtener todas las medallas de un usuario con detalles visuales
const obtenerMedallasPorUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const [todasMedallas] = await db.query('SELECT * FROM medallas ORDER BY id ASC');
        const [desbloqueadas] = await db.query(
            'SELECT medalla_id, fecha_obtenida FROM usuarios_medallas WHERE usuario_id = ?',
            [usuario_id]
        );

        const mapaDesbloqueadas = new Map();
        desbloqueadas.forEach(d => mapaDesbloqueadas.set(d.medalla_id, d.fecha_obtenida));

        const resultado = todasMedallas.map(m => ({
            id: m.id,
            nombre: m.nombre,
            descripcion: m.descripcion,
            icono_url: m.icono_url,
            desbloqueada: mapaDesbloqueadas.has(m.id),
            fecha_obtenida: mapaDesbloqueadas.get(m.id) || null
        }));

        res.json({
            mensaje: 'Medallas obtenidas',
            total: todasMedallas.length,
            desbloqueadas_count: desbloqueadas.length,
            datos: resultado
        });
    } catch (error) {
        console.error('Error en obtenerMedallasPorUsuario:', error);
        res.status(500).json({ mensaje: 'Error al obtener medallas' });
    }
};

module.exports = {
    registrarVisita,
    obtenerVisitasPorUsuario,
    obtenerMedallasPorUsuario
};
