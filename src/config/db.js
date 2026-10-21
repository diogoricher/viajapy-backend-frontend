const mysql = require('mysql2/promise');

// Creamos un "pool" de conexiones. 
// Un pool administra múltiples conexiones automáticamente, 
// lo cual es mucho más eficiente que abrir y cerrar conexiones en cada petición.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función autoejecutable para probar la conexión apenas se inicie el servidor
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos MySQL establecida correctamente.');
        
        // Creamos la tabla de itinerarios si no existe para permitir persistencia
        await connection.query(`
            CREATE TABLE IF NOT EXISTS itinerarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                titulo VARCHAR(255) NOT NULL,
                resumen TEXT,
                departamento VARCHAR(100),
                dias INT NOT NULL DEFAULT 1,
                detalle JSON NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `);
        
        connection.release(); // Siempre liberamos la conexión después de usarla
    } catch (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
        console.error('Asegúrate de que MySQL/XAMPP esté encendido y la base de datos "viajapy_db" exista.');
    }
})();

module.exports = pool;
