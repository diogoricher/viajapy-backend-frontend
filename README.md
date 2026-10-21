# 🇵🇾 ViajaPy - Backend API

Plataforma inteligente para la promoción, descubrimiento y planificación turística en Paraguay.

---

## 🚀 Tecnologías Principales
- **Entorno:** Node.js + Express
- **Base de Datos:** MySQL (con `mysql2/promise`)
- **Seguridad:** `bcryptjs` (hashing de contraseñas) y `jsonwebtoken` (JWT con RBAC)
- **Inteligencia Artificial:** SDK oficial `@google/genai` (Modelo `gemini-3.5-flash-lite` con RAG y respuestas estructuradas en JSON)
- **Conectividad:** `cors` habilitado para consumo desde clientes frontend y móviles

---

## 📂 Estructura del Proyecto

```text
viajapy/
├── documentacion/
│   ├── historial_dia_1.md
│   ├── historial_dia_2.md
│   ├── historial_dia_3.md
│   ├── historial_dia_4.md
│   ├── historial_dia_5.md
│   └── rol.md
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── itinerariosController.js
│   │   ├── lugaresController.js
│   │   ├── transporteController.js
│   │   ├── usuariosController.js
│   │   └── visitasController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   └── routes/
│       ├── itinerariosRoutes.js
│       ├── lugaresRoutes.js
│       ├── transporteRoutes.js
│       ├── usuariosRoutes.js
│       └── visitasRoutes.js
├── .env.example
├── index.js
└── package.json
```

---

## ⚙️ Configuración y Puesta en Marcha

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz tomando como base `.env.example`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=viajapy_db
JWT_SECRET=tu_clave_secreta_aqui
GEMINI_API_KEY=tu_clave_api_gemini
```

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Iniciar Servidor
```bash
node index.js
# o mediante nodemon:
npx nodemon index.js
```

---

## 📌 Catálogo Resumido de Endpoints

### 📍 Atractivos Turísticos (`/api/lugares`)
- `GET /api/lugares`: Lista de lugares (soporta `?departamento=` y `?categoria=`).
- `GET /api/lugares/:id`: Detalle de un lugar.
- `POST /api/lugares`: *(Admin)* Crear atractivo.
- `PUT /api/lugares/:id`: *(Admin)* Actualizar atractivo.
- `DELETE /api/lugares/:id`: *(Admin)* Eliminar atractivo.

### 👤 Usuarios y Autenticación (`/api/usuarios`)
- `POST /api/usuarios`: Registro de nuevos usuarios con contraseñas seguras.
- `POST /api/usuarios/login`: Autenticación y retorno del token JWT.

### 🏅 Visitas y Gamificación (`/api/visitas`)
- `POST /api/visitas`: *(Requiere Token)* Registro de visitas y desbloqueo de medallas.
- `GET /api/visitas/usuario/:usuario_id`: Historial de visitas para renderizado en mapa interactivo.

### 🤖 Planificador con IA (`/api/itinerarios`)
- `POST /api/itinerarios/generar`: Generación de itinerario personalizado con IA y datos de la BD.
- `POST /api/itinerarios/guardar`: *(Requiere Token)* Guardar itinerario generado en la cuenta.
- `GET /api/itinerarios/mis-itinerarios`: *(Requiere Token)* Consultar itinerarios guardados.
- `DELETE /api/itinerarios/:id`: *(Requiere Token)* Eliminar itinerario del usuario.

### 🚌 Transporte y Movilidad (`/api/transporte`)
- `GET /api/transporte/terminales`: Listado de terminales de ómnibus (admite `?departamento=`).
- `GET /api/transporte/rutas`: Rutas de buses, costos estimados y tiempos (admite `?origen=` y `?destino=`).
- `GET /api/transporte/distancia`: Cálculo de distancia geográfica y tiempo estimado de viaje (`?lat1=&lon1=&lat2=&lon2=`).
