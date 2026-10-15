# Historial de Desarrollo - ViajaPy (Día 1)

## 1. Revisión de Entorno
Comenzamos revisando el entorno de desarrollo. Confirmamos que contábamos con:
- **Node.js**: v24.15.0
- **XAMPP**: Instalado en `C:\xampp` con MySQL y phpMyAdmin disponibles.

## 2. Inicialización del Proyecto
- Ejecutamos `npm init -y` para crear el archivo `package.json`, que actúa como el "pasaporte" de nuestro proyecto.
- Instalamos **Express** (`npm install express`) para levantar nuestro servidor web y manejar rutas fácilmente.
- Creamos el archivo `index.js` inicial para probar el servidor en el puerto 3000.

## 3. Arquitectura y Base de Datos
Decidimos estructurar el proyecto utilizando un formato basado en rutas y controladores, además de preparar la conexión a la base de datos MySQL.

### Dependencias instaladas:
- `mysql2`: Para comunicarnos con la base de datos usando Promesas.
- `dotenv`: Para manejar variables de entorno y ocultar credenciales.

### Estructura de carpetas creada:
- `/.env`: Guarda las credenciales locales (usuario `root`, base de datos `viajapy_db`).
- `/src/config/db.js`: Configura el "pool" de conexiones a MySQL.
- `/src/routes/lugaresRoutes.js`: Define las rutas URL de la API.
- `/src/controllers/lugaresController.js`: Contiene la lógica para consultar la base de datos.

## 4. Creación de la Tabla 'lugares'
Ejecutamos el siguiente código SQL en phpMyAdmin para crear la primera tabla, agregando campos opcionales para `horario` y `precio`:

```sql
CREATE TABLE lugares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    coordenadas VARCHAR(100),
    horario VARCHAR(100) DEFAULT NULL,
    precio INT DEFAULT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO lugares (nombre, descripcion, departamento, coordenadas, horario, precio)
VALUES 
('Salto Cristal', 'Hermoso salto de agua rodeado de naturaleza.', 'Paraguarí', '-25.9083,-56.9288', '08:00 a 17:00', 30000),
('Ruinas Jesuíticas', 'Patrimonio de la Humanidad por la UNESCO.', 'Itapúa', '-27.1333,-55.7000', '07:00 a 19:00', 25000),
('Cerro Memby', 'Imponente cerro ideal para senderismo.', 'Concepción', NULL, NULL, NULL);
```

## 5. Primer Endpoint Funcional
Conectamos todo en `index.js` y probamos exitosamente la ruta `GET /api/lugares` en el navegador. La API respondió correctamente con un JSON conteniendo los datos de la base de datos.

## 6. Siguientes Pasos (Pendientes)
Para la próxima sesión, tenemos planeado continuar con el desarrollo de la tabla lugares:
1. Implementar la búsqueda de un lugar específico por ID (`GET /api/lugares/:id`).
2. Configurar una herramienta como *Thunder Client* o *Postman* para probar peticiones `POST`.
3. Implementar la creación de un nuevo lugar turístico (`POST /api/lugares`).
