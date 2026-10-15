# Historial de Desarrollo - ViajaPy (Día 4)

## 1. Integración de Inteligencia Artificial (Google Gemini)
Cumplimos con uno de los pilares centrales del proyecto: el **Planificador Inteligente de Viajes**.
- **Librería instalada:** `@google/genai` (SDK oficial de Google Gen AI).
- **Modelo utilizado:** `gemini-3.5-flash-lite`, optimizado para velocidad y respuestas de baja latencia.
- **RAG Simplificado (Contexto desde MySQL):**
  - El backend consulta primero los sitios turísticos existentes en la tabla `lugares` (filtrando opcionalmente por departamento).
  - Pasa esta lista como contexto enriquecido a la IA para que priorice recomendar lugares reales de nuestra plataforma.
- **Salida JSON Estructurada:**
  - Se configuró la opción `responseMimeType: 'application/json'` en la llamada a la IA.
  - Esto garantiza que Gemini responda siempre un JSON predecible con: `titulo`, `resumen`, `dias` (con actividades organizadas por mañana, tarde, noche y precios estimados), `recomendacion_gastronomica` y `consejos`.

## 2. Nuevos Endpoints Creados
- **`POST /api/itinerarios/generar`**:
  - **Entrada:** Recibe `{ dias, departamento, intereses, presupuesto }`.
  - **Salida:** Itinerario completo estructurado en formato JSON listo para que el frontend lo visualice.
  - **Archivos creados/modificados:**
    - `src/controllers/itinerariosController.js` (Controlador con la lógica de consulta y llamada a Gemini).
    - `src/routes/itinerariosRoutes.js` (Rutas del módulo de itinerarios).
    - `index.js` (Registro del prefijo `/api/itinerarios`).

## 3. Refactorización de Seguridad en Visitas
Siguiendo las mejoras planificadas desde el Día 3:
- **Protección con JWT:**
  - Se aplicó el middleware `verificarToken` a la ruta `POST /api/visitas`.
- **Prevención de Suplantación de Identidad:**
  - El controlador `visitasController.js` ahora extrae el `usuario_id` directamente del token verificado (`req.usuario.id`).
  - Esto evita que un usuario malintencionado pueda registrar visitas o adjudicarse medallas a nombre de otro ID en el cuerpo de la petición.

## 4. Estado Actual de la API
- `/api/lugares`: CRUD completo con protección de rutas administrativas (Admin).
- `/api/usuarios`: Registro con hashing de contraseñas (`bcryptjs`) y login con tokens (`JWT`).
- `/api/visitas`: Registro protegido por token y consulta de historial para pintar el mapa interactivo.
- `/api/itinerarios`: Generación de planes turísticos inteligentes con IA y lugares reales.
- **Gamificación activa:** Medallas "Explorador Novato" (1ra visita) y "Aventurero del Sur" (3 visitas en Itapúa).

## Siguientes Pasos Recomendados (Día 5)
1. **Persistencia de Itinerarios:** Crear una tabla en MySQL para que el usuario pueda guardar sus itinerarios favoritos (`POST /api/itinerarios/guardar`).
2. **CORS:** Instalar y configurar el paquete `cors` en Express para permitir que el frontend de tu compañero se conecte sin bloqueos de navegador.
3. **Módulo de Transporte:** Endpoints informativos de rutas y terminales de buses de Paraguay.
