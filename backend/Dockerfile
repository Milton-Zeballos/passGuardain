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

# Arranca migraciones y luego servidor ASGI (Channels/WebSockets) con daphne
CMD ["sh", "-c", "python manage.py migrate --noinput && exec daphne -b 0.0.0.0 -p 8000 backend.asgi:application"]