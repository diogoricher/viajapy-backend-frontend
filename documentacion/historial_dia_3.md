# Historial de Desarrollo - ViajaPy (Día 3)

## 1. Seguridad en las Contraseñas (Hashing)
Comenzamos el día solucionando una vulnerabilidad crítica: las contraseñas guardadas en texto plano.
- **Herramienta instalada:** `bcryptjs`
- **Implementación:** Modificamos el endpoint `POST /api/usuarios` (crearUsuario). Ahora, antes de guardar un nuevo usuario, generamos un "salt" y encriptamos la contraseña utilizando `bcrypt.hash()`. En la base de datos ahora solo se almacenan cadenas irreversibles.

## 2. Autenticación e Inicio de Sesión
Creamos el sistema para que los usuarios puedan autenticarse en la plataforma.
- **Endpoint creado:** `POST /api/usuarios/login`
- **Lógica:** El backend busca al usuario por su email. Si existe, utiliza `bcrypt.compare()` para verificar si la contraseña enviada en la petición coincide matemáticamente con el hash almacenado en la base de datos.

## 3. Autorización (JSON Web Tokens - JWT)
Para evitar pedir correo y contraseña en cada petición, implementamos tokens de sesión.
- **Herramienta instalada:** `jsonwebtoken`
- **Generación:** Al iniciar sesión correctamente, el servidor firma un token (JWT) que contiene el `id`, `email` y `rol` del usuario. Este token tiene una validez de 24 horas y se envía como respuesta al frontend.

## 4. Middleware y Sistema de Roles (RBAC)
Planteamos una discusión arquitectónica sobre la seguridad de las rutas. Concluimos que, por regla general ("Nunca confíes en el Frontend"), el backend debe proteger las rutas sensibles.
- **Base de datos:** Ejecutamos `ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) DEFAULT 'turista';` para establecer roles.
- **Guardias de Seguridad (Middlewares):** Creamos el archivo `authMiddleware.js` con dos funciones:
  1. `verificarToken`: Lee el header `Authorization`, extrae el token "Bearer", lo valida y guarda los datos en `req.usuario`.
  2. `verificarAdmin`: Se asegura de que el usuario tenga el rol `'admin'`.
- **Rutas Protegidas:** Aplicamos estos middlewares en `lugaresRoutes.js` para los métodos `POST`, `PUT` y `DELETE`. Ahora, solo los administradores logueados pueden modificar el catálogo de lugares turísticos.

## 5. Pruebas y Validación
- Utilizamos **Thunder Client** para simular el ciclo completo:
  - Intento fallido de crear lugar sin token.
  - Creación de un usuario nuevo (con contraseña encriptada).
  - Login exitoso para obtener el Token.
  - Modificación del rol a `admin` en phpMyAdmin.
  - Obtención de un nuevo token y creación exitosa de un lugar turístico usando dicho token.

## Siguientes Pasos (Día 4)
- Integrar la **Inteligencia Artificial (API de Gemini)** para crear el núcleo del Planificador de Viajes.
- Crear rutas (`POST /api/itinerarios/generar`) que reciban preferencias del usuario y devuelvan rutas turísticas personalizadas.
- (Opcional) Refactorizar el sistema de `visitas` para que utilice el ID del usuario directamente desde su JWT (`req.usuario.id`) en lugar de depender del cuerpo de la petición.
