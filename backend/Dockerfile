# Usa una imagen oficial de Python liviana
FROM python:3.11-slim

# Variables de entorno para optimizar Python en Docker
# Evita que Python genere archivos .pyc y asegura que los logs se vean en tiempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalación de dependencias del sistema necesarias para mysqlclient y herramientas de compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libmariadb-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de requerimientos primero para aprovechar la caché de capas de Docker
COPY requirements.txt /app/

# Instalación de dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código del proyecto al contenedor
COPY . /app/

# Exponer el puerto que usa Django por defecto
EXPOSE 8000

# Comando para iniciar el servidor de desarrollo (útil para pruebas)
# --noreload: con el código montado por volumen, el autoreload de Django puede
# reiniciar el proceso cuando MySQL aún no responde y dejar el contenedor sin
# ningún proceso escuchando en 8000 (conexión rechazada desde el host).
# migrate: aplica esquema en el arranque para que check_migrations no falle en frío.
# En producción se recomienda usar gunicorn y un entrypoint con wait-for-db.
CMD ["sh", "-c", "python manage.py migrate --noinput && exec python manage.py runserver 0.0.0.0:8000 --noreload"]