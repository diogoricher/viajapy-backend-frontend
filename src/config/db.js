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
        connection.release(); // Siempre liberamos la conexión después de usarla
    } catch (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
        console.error('Asegúrate de que MySQL/XAMPP esté encendido y la base de datos "viajapy_db" exista.');
    }
})();

module.exports = pool;
