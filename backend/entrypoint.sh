#!/bin/sh
# ============================================================
# PassGuardian - Entrypoint de producción
# Espera que MySQL esté listo antes de arrancar Django
# ============================================================

echo "⏳ Esperando que MySQL esté listo..."

# Espera activa hasta que Django pueda conectarse a la DB
until python manage.py migrate --noinput 2>&1; do
  echo "🔄 MySQL no está listo todavía, reintentando en 5 segundos..."
  sleep 5
done

echo "✅ Base de datos lista, migraciones aplicadas."

# Iniciar Daphne (servidor ASGI de producción con soporte WebSockets)
exec daphne -b 0.0.0.0 -p 8000 backend.asgi:application
