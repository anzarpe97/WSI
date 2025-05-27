from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-xx+0%b$%i!wer#ucd9+83iq57yns=ysam#a882y*elt+e+p@^4'

DEBUG = True  

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

ALLOWED_HOSTS = []  

INSTALLED_APPS = [
    'django.contrib.admin',               
    'django.contrib.auth',                
    'django.contrib.contenttypes',       
    'django.contrib.sessions',           
    'django.contrib.messages',           
    'django.contrib.staticfiles',         
    'corsheaders',                        
    'rest_framework',                   
    'rest_framework.authtoken',          
    'WSI_API.apps.WsiApiConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'WSI_API.middleware.IPRestrictMiddleware',
]

ROOT_URLCONF = 'WSI.urls'

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


# --- Aución ---
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



CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]



CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CSRF_COOKIE_NAME = "csrftoken"
CSRF_COOKIE_SECURE = False        
CSRF_COOKIE_HTTPONLY = False      
CSRF_COOKIE_SAMESITE = 'Lax' 

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'enviarpruebacorreo1@gmail.com'
EMAIL_HOST_PASSWORD = 'ppmc jwgm cpjd nbrs'
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
DEFAULT_FROM_EMAIL = 'WSI <enviarpruebacorreo1@gmail.com>'