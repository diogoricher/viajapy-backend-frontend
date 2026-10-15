# Historial de Desarrollo - ViajaPy (Día 2)

## 1. Finalización del CRUD de Lugares Turísticos
Retomamos el proyecto para completar la gestión de los lugares turísticos en nuestra base de datos.
- **Implementados:**
  - `GET /api/lugares/:id`: Obtener un lugar específico por su ID.
  - `POST /api/lugares`: Crear un nuevo lugar.
  - `PUT /api/lugares/:id`: Actualizar la información de un lugar existente.
  - `DELETE /api/lugares/:id`: Eliminar un lugar.
- **Herramientas introducidas:** Comenzamos a utilizar **Thunder Client** (o Postman) para simular las peticiones que en el futuro hará el frontend, ya que el navegador por defecto solo realiza peticiones `GET`.

## 2. Sistema de Usuarios
Dimos el primer paso hacia la personalización de la plataforma creando el sistema básico de usuarios.
- **Base de datos:** Creamos la tabla `usuarios` (id, nombre, email, password).
- **Controlador y Rutas:**
  - `POST /api/usuarios`: Endpoint para registrar nuevos usuarios.
  - `GET /api/usuarios`: Listado de usuarios. Como buena práctica de seguridad, evitamos enviar la contraseña en la respuesta JSON.

## 3. Arquitectura de Visitas (Base del Mapa Interactivo)
Creamos una tabla intermedia llamada `visitas` que conecta a un usuario con un lugar turístico.
- **Endpoint POST (`/api/visitas`):** Registra que un usuario visitó un lugar específico. Controla que no se puedan duplicar visitas al mismo lugar.
- **Endpoint GET (`/api/visitas/usuario/:id`):** Devuelve el historial de viajes de un usuario. Aquí aplicamos un **`JOIN` de SQL** para cruzar los datos de las visitas con los de los lugares (obteniendo el nombre, departamento y coordenadas). Esta información será vital para colorear el mapa interactivo en el frontend.

## 4. Implementación del Sistema de Gamificación (Medallas)
Para fomentar el turismo, implementamos el sistema de recompensas prometido en la concepción del proyecto.
- **Tablas Creadas:**
  - `medallas`: Catálogo de insignias disponibles (ej. "Explorador Novato", "Aventurero del Sur").
  - `usuarios_medallas`: Registro de qué usuario desbloqueó cada insignia.
- **Lógica en el Controlador:** Modificamos el registro de visitas para evaluar el progreso del usuario automáticamente:
  1. Si es la **primera visita total** del usuario, se le otorga la medalla "Explorador Novato".
  2. Si el usuario alcanza **3 visitas** en lugares distintos del departamento de "Itapúa", desbloquea la medalla "Aventurero del Sur".
  3. La API responde dinámicamente con un mensaje de celebración si se desbloquea una medalla.

## Siguientes Pasos (Día 3)
- Mejorar la seguridad del sistema: Encriptar las contraseñas de los usuarios antes de guardarlas en la base de datos (usando `bcrypt`).
- Crear el endpoint de "Inicio de Sesión" (Login) y entender el manejo de autenticación.
- (Opcional) Extender la gamificación a más departamentos.
