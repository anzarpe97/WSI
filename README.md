# 🚚 WSI — Gestión de Flota, Mantenimientos y Documentos

Plataforma web para la gestión centralizada de vehículos, mantenimientos, documentos y reportes de fallas para World Service International, con backend en Django/DRF y frontend en React + Vite.

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-blue)
![Backend](https://img.shields.io/badge/backend-Django%20%2B%20DRF-44b78b)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)

---

## 📦 Monorepo

Estructura principal del proyecto:

- Backend (Django/DRF): `Backend/`
	- Proyecto: `Backend/WSI/`
	- App: `Backend/WSI_API/`
- Frontend (React/Vite): `wsi/`

---

## ✨ Funcionalidades

- Autenticación por token (DRF TokenAuth) y verificación de sesión.
- Gestión de usuarios (admin/supervisor/empleado) con borrado lógico.
- Gestión de vehículos y mantenimientos (creación, edición, finalización, borrado lógico, costos de insumos).
- Gestión de documentos de vehículos y choferes (subida de archivos, actualización y detalle).
- Reportes de fallas: creación, listado, marcado como “atendido” (revisada) y borrado lógico.
- Notificaciones por usuario y globales, con marca de leído individual o masivo.
- Estadísticas básicas (vehículos con más mantenimientos).

---

## 🛠️ Tecnologías

- Backend: Django, Django REST Framework, MySQL, django-cors-headers
- Frontend: React 19, Vite 6, React Router, React Toastify, Recharts, jsPDF/html2canvas
- Infra básica: Servido en desarrollo con `runserver` y `vite dev`

---

## ⚙️ Requisitos

- Python 3.10+ (recomendado 3.12+)
- MySQL 8+
- Node.js 18+ y npm

---

## 🔧 Configuración (Backend)

1) Variables de entorno en `Backend/.env` (ejemplo):

```
SECRET_KEY=tu_clave_secreta
DEBUG=True

DB_NAME=wsi
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=127.0.0.1
DB_PORT=3306

EMAIL_HOST=smtp.tu_proveedor.com
EMAIL_PORT=587
EMAIL_HOST_USER=notificaciones@tu_dominio.com
EMAIL_HOST_PASSWORD=tu_pass
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
DEFAULT_FROM_EMAIL=notificaciones@tu_dominio.com
```

2) Instala dependencias, migra y crea superusuario (Windows PowerShell):

```powershell
cd Backend
python -m venv venv
venv\Scripts\Activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

3) Ejecuta el servidor (escuchando en la red local):

```powershell
python manage.py runserver 0.0.0.0:8000
```

Notas:
- En `settings.py` se permite acceso desde cualquier host (`ALLOWED_HOSTS=['*']`) y CORS abierto para desarrollo.
- Si accedes desde teléfono en la misma red, usa la IP local de tu laptop (ej.: `http://192.168.0.10:8000`). Acepta el permiso del Firewall de Windows para Python (red privada).

---

## 🖥️ Configuración (Frontend)

1) Instala dependencias y ejecuta:

```powershell
cd wsi
npm install
npm run dev
```

El frontend está configurado para aceptar conexiones en red local (`host: 0.0.0.0`, `port: 5173`). Acceso típico:
- PC: http://localhost:5173
- Teléfono (misma red): http://<IP_de_tu_PC>:5173

---

## 🔐 Autenticación

- Login: `POST /api/login/` devuelve `token` y datos del usuario.
- Verificación de token: `GET /api/verify-token/` (requiere header `Authorization: Token <token>`).
- El frontend guarda el token en `localStorage` y lo envía en llamadas protegidas.

---

## 🔗 Endpoints principales (resumen)

- Usuarios
	- `POST /api/registro/` — Registro
	- `GET /api/usuarios/` — Listado (admin/supervisor)
	- `DELETE /api/usuarios/<id>/` — Borrado lógico
	- Recuperación de contraseña: `POST /api/solicitar-restablecimiento/` y `POST /api/reset-password/`

- Vehículos
	- `GET /api/vehiculos/` — Listado
	- `POST /api/vehiculos/registrar/` — Crear
	- `GET|PUT|PATCH /api/vehiculos/<id_vehiculo>/` — Detalle/actualización
	- `GET /api/vehiculos/buscar/?placa=ABC123` — Buscar por placa

- Mantenimientos
	- `GET /api/mantenimientos/` — Listado
	- `POST /api/mantenimientos/crear/` — Crear
	- `GET|PATCH /api/detalle-mantenimiento/<id>/` — Detalle/actualización (borrado lógico via `borrado=True`)
	- `POST /api/mantenimientos/<id>/finalizar/` — Finalizar, registra insumos y reactiva vehículo

- Documentos (Choferes y Vehículos)
	- Chofer: `GET|PUT|PATCH /api/documentos-chofer/<id_documento_chofer>/`
	- Vehículo (lista filtrable): `GET /api/documentos-vehiculos/?vehiculo=<id_vehiculo>`
	- Vehículo (crear): `POST /api/documentos-vehiculos/crear/`
	- Vehículo (detalle): `GET|PUT|PATCH /api/documentos-vehiculos/<id_documento_vehiculo>/` (soporta multipart)

- Reportes de Fallas
	- `POST /api/reportes-fallas/crear/` — Crear
	- `GET /api/reportes-fallas/` — Listar (filtrado de eliminadas en frontend)
	- `GET|PATCH /api/reportes-fallas/<id>/` — Detalle/actualización (`revisada=True` para “Atendido”, `eliminada=True` para borrado lógico)

- Notificaciones
	- `GET /api/notificaciones/` — Listado por usuario
	- `PATCH /api/notificaciones/<id>/marcar-leida/` — Marcar leída
	- `PATCH /api/notificaciones/marcar-todas-leidas/` — Marcar todas como leídas

> Todas las rutas protegidas requieren `Authorization: Token <token>`.

---

## 🗂️ Archivos y medios

- Archivos subidos se guardan en `Backend/media/`:
	- `documentos_vehiculos/`
	- `documentos_choferes/`
- En desarrollo se sirven vía `MEDIA_URL=/media/`.

---

## 🧪 Scripts útiles

Frontend (`wsi/package.json`):

```json
{
	"scripts": {
		"dev": "vite",
		"build": "vite build",
		"preview": "vite preview",
		"lint": "eslint ."
	}
}
```

VS Code (opcional): tareas preconfiguradas
- Iniciar Backend: activa `venv` y lanza `manage.py runserver`
- Iniciar Frontend: `npm start` (ajusta a `npm run dev` si lo prefieres)

---

## 🚀 Despliegue (notas rápidas)

- Restringe `ALLOWED_HOSTS`, `CORS` y `CSRF` a tus dominios.
- Sirve estáticos y media con un servidor (Nginx) y ejecuta Django con Gunicorn/Uvicorn.
- Configura variables de entorno seguras y deshabilita `DEBUG`.

---

## 🤝 Contribución

1. Crea un issue para discutir cambios.
2. Crea una rama desde `dev` y envía un PR con descripción clara.

---

## 📄 Licencia

Proyecto académico. Licencia pendiente/privada (sin licencia pública declarada).

