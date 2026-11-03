from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='autolink-dev-secret-key-change-in-production-!@#$%^')
DEBUG = config('DEBUG', default=True, cast=bool)

# OAuth Google — client ID de l'application web (Google Cloud Console)
GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID', default='')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'apps.users',
    'apps.vehicles',
    'apps.bookings',
    'apps.payments',
    'apps.drivers',
    'apps.inspections',
    'apps.affiliates',
    'apps.messaging',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'apps' / 'users' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

try:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(
            default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
            conn_max_age=600,
        )
    }
except ImportError:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'config.pagination.StandardPagination',
    'DEFAULT_THROTTLE_RATES': {
        'contact': '5/min',
    },
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
}

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000').split(',')
CORS_ALLOW_CREDENTIALS = True

COMMISSION_RATE = config('COMMISSION_RATE', default=0.50, cast=float)
DRIVER_SHARE_RATE = config('DRIVER_SHARE_RATE', default=0.10, cast=float)

# ─── Paiements externes (LIVE) ────────────────────────────────────────────────
# Les secrets ne sont JAMAIS commités : ils viennent des variables d'env (.env
# local non versionné / variables Dokploy en production).
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')
CONTACT_EMAIL = config('CONTACT_EMAIL', default='wibchallenge@gmail.com')
FCFA_PER_USD = config('FCFA_PER_USD', default=600, cast=int)  # conversion PayPal

STRIPE_API_KEY = config('STRIPE_API_KEY', default='')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default='')

PAYPAL_CLIENT_ID = config('PAYPAL_CLIENT_ID', default='')
PAYPAL_CLIENT_SECRET = config('PAYPAL_CLIENT_SECRET', default='')
PAYPAL_MODE = config('PAYPAL_MODE', default='sandbox')  # 'live' | 'sandbox'
PAYPAL_PAYOUTS_ENABLED = config('PAYPAL_PAYOUTS_ENABLED', default=False, cast=bool)

MTN_MOMO_SUBSCRIPTION_KEY = config('MTN_MOMO_SUBSCRIPTION_KEY', default='')
MTN_MOMO_API_USER = config('MTN_MOMO_API_USER', default='')
MTN_MOMO_API_KEY = config('MTN_MOMO_API_KEY', default='')
MTN_MOMO_TARGET_ENV = config('MTN_MOMO_TARGET_ENV', default='sandbox')
MTN_MOMO_BASE_URL = config('MTN_MOMO_BASE_URL', default='https://sandbox.momodeveloper.mtn.com')
MTN_MOMO_CURRENCY = config('MTN_MOMO_CURRENCY', default='EUR')

ORANGE_CLIENT_ID = config('ORANGE_CLIENT_ID', default='')
ORANGE_CLIENT_SECRET = config('ORANGE_CLIENT_SECRET', default='')
ORANGE_MERCHANT_KEY = config('ORANGE_MERCHANT_KEY', default='')
ORANGE_OM_BASE_URL = config('ORANGE_OM_BASE_URL', default='https://api.orange.com/orange-money-webpay/dev/v1')
ORANGE_OM_CURRENCY = config('ORANGE_OM_CURRENCY', default='OUV')

# ─── Site URL (for email templates and links) ───────────────────────────────────
SITE_URL = config('SITE_URL', default='https://autolink-pro.worldwide-international.business')

# ─── Email (codes de connexion OTP, notifications) ────────────────────────────
# Dev : console (le code s'affiche dans les logs). Prod : configurez le SMTP
# via les variables d'environnement (ex. Gmail : EMAIL_HOST_USER=… /
# EMAIL_HOST_PASSWORD=<mot de passe d'application>).
EMAIL_BACKEND = config('EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config(
    'DEFAULT_FROM_EMAIL',
    default='AutoLink Pro <no-reply@autolink-pro.worldwide-international.business>')


# ─── Logs ────────────────────────────────────────────────────────────────────
# Tout part sur stdout/stderr : visible dans les logs du conteneur (Dokploy).
# Les erreurs 500 (django.request) remontent avec leur traceback complet.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
