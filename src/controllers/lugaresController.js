const db = require('../config/db');

// Función para obtener todos los lugares de la base de datos
const obtenerLugares = async (req, res) => {
    try {
        // Hacemos la consulta SQL a la tabla que acabas de crear
        const [rows] = await db.query('SELECT * FROM lugares');
        
        // Respondemos al frontend con los datos en formato JSON
        res.json({
            mensaje: 'Lista de lugares obtenida con éxito',
            cantidad: rows.length,
            datos: rows
        });
    } catch (error) {
        console.error('Error en obtenerLugares:', error);
        res.status(500).json({ mensaje: 'Error al obtener los lugares de la base de datos' });
    }
};

// Función para obtener un lugar por su ID
const obtenerLugarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM lugares WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Lugar no encontrado' });
        }
        
        res.json({
            mensaje: 'Lugar obtenido con éxito',
            datos: rows[0]
        });
    } catch (error) {
        console.error('Error en obtenerLugarPorId:', error);
        res.status(500).json({ mensaje: 'Error al obtener el lugar' });
    }
};

// Función para crear un nuevo lugar
const crearLugar = async (req, res) => {
    try {
        const { nombre, descripcion, departamento, coordenadas, horario, precio } = req.body;
        
        // Validación básica
        if (!nombre || !descripcion || !departamento) {
            return res.status(400).json({ mensaje: 'Nombre, descripción y departamento son obligatorios' });
        }
        
        const [result] = await db.query(
            'INSERT INTO lugares (nombre, descripcion, departamento, coordenadas, horario, precio) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, departamento, coordenadas || null, horario || null, precio || null]
        );
        
        res.status(201).json({
            mensaje: 'Lugar creado con éxito',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error en crearLugar:', error);
        res.status(500).json({ mensaje: 'Error al crear el lugar' });
    }
};

// Función para actualizar un lugar existente (PUT)
const actualizarLugar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, departamento, coordenadas, horario, precio } = req.body;

        // Comprobamos si el lugar existe antes de actualizar
        const [existe] = await db.query('SELECT * FROM lugares WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ mensaje: 'Lugar no encontrado para actualizar' });
        }

        await db.query(
            'UPDATE lugares SET nombre = ?, descripcion = ?, departamento = ?, coordenadas = ?, horario = ?, precio = ? WHERE id = ?',
            [nombre, descripcion, departamento, coordenadas || null, horario || null, precio || null, id]
        );

        res.json({ mensaje: 'Lugar actualizado con éxito' });
    } catch (error) {
        console.error('Error en actualizarLugar:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el lugar' });
    }
};

// Función para eliminar un lugar (DELETE)
const eliminarLugar = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM lugares WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Lugar no encontrado para eliminar' });
        }

        res.json({ mensaje: 'Lugar eliminado con éxito' });
    } catch (error) {
        console.error('Error en eliminarLugar:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el lugar' });
    }
};

module.exports = {
    obtenerLugares,
    obtenerLugarPorId,
    crearLugar,
    actualizarLugar,
    eliminarLugar
};
