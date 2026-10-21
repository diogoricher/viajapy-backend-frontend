# Historial de Desarrollo - ViajaPy (Día 5 - Cierre de Proyecto)

## 1. Conexión Frontend-Backend Habilitada (CORS)
- **Librería instalada:** `cors`.
- **Configuración:** Integrado como middleware global en `index.js`.
- **Impacto:** Permite peticiones asíncronas desde el cliente web o móvil (desarrollado en React, Vue o HTML/JS independiente) sin bloqueos de política del mismo origen (Cross-Origin Resource Sharing).

## 2. Persistencia y Gestión de Itinerarios Inteligentes
Completamos el ciclo de vida del planificador con IA permitiendo que los usuarios autenticados guarden y gestionen sus planes favoritos:
- **Base de Datos:** Inicialización automática de la tabla `itinerarios` en `db.js` con soporte de campo estructurado `JSON` y clave foránea `usuario_id` con eliminación en cascada.
- **Nuevos Endpoints Protegidos (`/api/itinerarios`):**
  - `POST /api/itinerarios/guardar`: Guarda el itinerario generado junto al ID del usuario autenticado (extraído de su token JWT).
  - `GET /api/itinerarios/mis-itinerarios`: Retorna la lista de itinerarios creados por el usuario logueado en orden cronológico inverso, con el detalle ya parseado en JSON.
  - `DELETE /api/itinerarios/:id`: Permite al usuario eliminar un itinerario propio de su historial de forma segura.

## 3. Módulo de Transporte y Movilidad Nacional
- **Controlador y Rutas:** `src/controllers/transporteController.js` y `src/routes/transporteRoutes.js`.
- **Endpoints creados:**
  - `GET /api/transporte/terminales`: Listado de terminales de buses principales de Paraguay (Asunción, CDE, Encarnación, Villarrica, Pedro Juan Caballero) con filtros por departamento.
  - `GET /api/transporte/rutas`: Tiempos estimados, precios aproximados en Guaraníes, rutas nacionales y empresas de transporte sugeridas para los principales corredores del país (PY01, PY02, PY06, etc.).
  - `GET /api/transporte/distancia`: Cálculo de distancia geográfica y tiempo estimado de viaje entre dos coordenadas usando la fórmula de Haversine (`?lat1=&lon1=&lat2=&lon2=`).

## 4. Estado Final de la API (Catálogo de Endpoints)

| Módulo | Método | Endpoint | Acceso / Protección | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **General** | `GET` | `/` | Público | Verificación del estado de la API y lista de módulos |
| **Lugares** | `GET` | `/api/lugares` | Público | Lista de atractivos con filtros (`departamento`, `categoria`) |
| **Lugares** | `GET` | `/api/lugares/:id` | Público | Detalle de un atractivo turístico |
| **Lugares** | `POST` | `/api/lugares` | Admin (`JWT`) | Crear nuevo atractivo turístico |
| **Lugares** | `PUT` | `/api/lugares/:id` | Admin (`JWT`) | Modificar atractivo existente |
| **Lugares** | `DELETE` | `/api/lugares/:id` | Admin (`JWT`) | Eliminar atractivo turístico |
| **Usuarios** | `POST` | `/api/usuarios` | Público | Registro de usuario (password hasheado con `bcryptjs`) |
| **Usuarios** | `POST` | `/api/usuarios/login` | Público | Inicio de sesión y entrega de token `JWT` |
| **Visitas** | `POST` | `/api/visitas` | Usuario (`JWT`) | Registra visita turística y adjudica medallas (Gamificación) |
| **Visitas** | `GET` | `/api/visitas/usuario/:usuario_id`| Público/Usuario | Historial de visitas para mapa interactivo de lugares visitados |
| **Itinerarios** | `POST` | `/api/itinerarios/generar` | Público | Generación de planes turísticos con Google Gemini (RAG) |
| **Itinerarios** | `POST` | `/api/itinerarios/guardar` | Usuario (`JWT`) | Guardar plan generado en la cuenta del usuario |
| **Itinerarios** | `GET` | `/api/itinerarios/mis-itinerarios` | Usuario (`JWT`) | Consultar itinerarios guardados |
| **Itinerarios** | `DELETE` | `/api/itinerarios/:id` | Usuario (`JWT`) | Eliminar itinerario guardado |
| **Transporte** | `GET` | `/api/transporte/terminales` | Público | Datos de terminales de ómnibus de Paraguay |
| **Transporte** | `GET` | `/api/transporte/rutas` | Público | Rutas de ómnibus, empresas, duración y costos |
| **Transporte** | `GET` | `/api/transporte/distancia` | Público | Estimación de distancia en km y tiempo de viaje en auto |

## 5. Conclusión del Proyecto
El backend de **ViajaPy** queda completamente finalizado, modularizado, seguro y listo para su consumo desde el cliente frontend o despliegue en entornos de producción.
