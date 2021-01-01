"""
Django settings for solomon project.

Generated by 'django-admin startproject' using Django 3.1.3.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""

from pathlib import Path
import os
import sys

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

SECRET_KEY = open("/run/secrets/django-secret-key").read().strip()

DEBUG = False

if os.environ.get("DEBUG", ""):
    print("SECURITY WARNING: don't run with debug turned on in production!")
    DEBUG = True

ALLOWED_HOSTS = ['*']

# Test Configurations
TEST_RUNNER = 'xmlrunner.extra.djangotestrunner.XMLTestRunner'
TEST_OUTPUT_VERBOSE = True
TEST_OUTPUT_DESCRIPTIONS = True
TEST_OUTPUT_DIR = '/tmp/xmlrunner'

# Application definition

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'rest_framework',
    'corsheaders',
    'src',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.RemoteUserMiddleware',
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'django.contrib.auth.backends.RemoteUserBackend',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
}

JWT_AUTH = {
    'JWT_ALGORITHM': 'RS256',
    'JWT_AUDIENCE': 'https://solomon.money/api',
    'JWT_ISSUER': 'https://cashflow-projection.us.auth0.com/',
    'JWT_AUTH_HEADER_PREFIX': 'Bearer',
}

ROOT_URLCONF = 'solomon.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'solomon.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases


if 'test' in sys.argv:
    # unit tests run with sqllite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'my_database',
        }
    }
else:
    # everything else runs with MySQL
    database_name = open("/run/secrets/db-name").read().strip()

    username = None
    try:
        username = open("/run/secrets/db-migration-username").read().strip()
    except:
        username = open("/run/secrets/db-username").read().strip()

    password = None
    try:
        password = open("/run/secrets/db-migration-password").read().strip()
    except:
        password = open("/run/secrets/db-password").read().strip()

    host = open("/run/secrets/db-host").read().strip()
    port = open("/run/secrets/db-port").read().strip()

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': database_name,
            'USER': username,
            'PASSWORD': password,
            'HOST': host,
            'PORT': port,
            'OPTIONS': {
                'init_command': "SET sql_mode='STRICT_ALL_TABLES'",
            },
        }
    }


# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = False

USE_L10N = False

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'

CORS_ORIGIN_ALLOW_ALL = False
cors_origin_whitelist_string = os.environ.get("CORS_ORIGIN_WHITELIST", "")
CORS_ORIGIN_WHITELIST = cors_origin_whitelist_string.split(",") if cors_origin_whitelist_string else []

#
# Rest framework
#
REST_FRAMEWORK = {
    'COERCE_DECIMAL_TO_STRING': False
}

#
# Logging
#
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}