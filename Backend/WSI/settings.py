from pathlib import Path

# --- Rutas base ---
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Seguridad ---
SECRET_KEY = 'django-insecure-xx+0%b$%i!wer#ucd9+83iq57yns=ysam#a882y*elt+e+p@^4'

DEBUG = True  # Recuerda poner False en producción

ALLOWED_HOSTS = []  # Para desarrollo local esto está bien


# --- Aplicaciones instaladas ---
INSTALLED_APPS = [
    'django.contrib.admin',               # Admin de Django
    'django.contrib.auth',                # Sistema de autenticación
    'django.contrib.contenttypes',        # Manejo de tipos de contenido
    'django.contrib.sessions',            # Manejo de sesiones
    'django.contrib.messages',            # Mensajes del sistema
    'django.contrib.staticfiles',         # Archivos estáticos

    # Terceros
    'corsheaders',                        # CORS para frontend
    'rest_framework',                    # DRF para APIs
    'rest_framework.authtoken',          # Token auth

    # Tu app
    'WSI_API.apps.WsiApiConfig',
]


# --- Middleware ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    
    # Cors debe ir antes que CommonMiddleware
    'corsheaders.middleware.CorsMiddleware',
    
    'django.middleware.common.CommonMiddleware',

    # Middleware CSRF habilitado para protección
    'django.middleware.csrf.CsrfViewMiddleware',
    
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # Middleware personalizado (si tienes)
    'WSI_API.middleware.IPRestrictMiddleware',
]


# --- Configuración de URLs ---
ROOT_URLCONF = 'WSI.urls'


# --- Plantillas (templates) ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',  # Backend obligatorio para admin
        'DIRS': [],  # Puedes agregar aquí rutas a templates si usas
        'APP_DIRS': True,  # Busca en los templates de apps instaladas
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',          # Debug context (útil en desarrollo)
                'django.template.context_processors.request',        # Necesario para admin y csrf en templates
                'django.contrib.auth.context_processors.auth',       # Usuario en templates
                'django.contrib.messages.context_processors.messages',# Mensajes en templates
            ],
        },
    },
]


# --- WSGI ---
WSGI_APPLICATION = 'WSI.wsgi.application'


# --- Base de datos ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'wsi',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}


# --- Autenticación ---
AUTH_USER_MODEL = 'WSI_API.Usuario'


# --- Validadores de contraseña ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]


# --- Internacionalización ---
LANGUAGE_CODE = 'es-VE'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True


# --- Archivos estáticos ---
STATIC_URL = '/static/'


# --- Campo Auto ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- REST Framework ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # Token para API
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Por defecto acceso público, controla en vistas
    ],
}


# --- CORS ---
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


# --- CSRF ---
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CSRF_COOKIE_NAME = "csrftoken"
CSRF_COOKIE_SECURE = False        # En producción debe ser True si usas HTTPS
CSRF_COOKIE_HTTPONLY = False      # Para poder acceder desde JS (si necesario)
CSRF_COOKIE_SAMESITE = 'Lax'      # Protege CSRF


# --- Otros posibles ajustes (opcional) ---
# SESSION_COOKIE_SECURE = False    # Igual que CSRF_COOKIE_SECURE
# SESSION_COOKIE_SAMESITE = 'Lax'
