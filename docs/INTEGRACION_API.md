# Integración API (backend ↔ frontend)

Guía corta para consumir el backend desde Expo/React Native. La referencia interactiva sigue siendo **Swagger**.

## URLs base

- **API (prefijo común):** `http://localhost:8000/api/` (o la IP de tu PC en la red, p. ej. `http://192.168.x.x:8000/api/`)
- **Swagger UI:** `http://localhost:8000/api/docs/`
- **OpenAPI JSON:** `http://localhost:8000/api/schema/`

En el proyecto móvil, la base se configura en `mobile/src/services/api.js`:

- Android emulador por defecto: `http://10.0.2.2:8000/api`
- iOS / web por defecto: `http://localhost:8000/api`
- Override recomendado para dispositivo físico o LAN:

  ```text
  EXPO_PUBLIC_API_URL=http://TU_IP:8000/api
  ```

## Autenticación (JWT)

Todas las rutas CRUD requieren cabecera:

```http
Authorization: Bearer <access_token>
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login/` | Body: `{"username":"...","password":"..."}`. Respuesta incluye `access` y `refresh`. |
| POST | `/api/auth/refresh/` | Body: `{"refresh":"<refresh_token>"}`. Devuelve nuevo `access`. |
| GET | `/api/auth/me/` | Perfil del usuario autenticado. |

### Usuario de demostración (solo desarrollo)

Creado en la base para pruebas de demo (cambiar o eliminar en producción):

- **Usuario:** `demo`
- **Contraseña:** `Demo12345!`

En Swagger: **Authorize** → pegar **solo** el valor de `access` (sin la palabra `Bearer`).

## CRUD (requieren JWT)

Prefijo: `/api/`

| Recurso | Listar / crear | Detalle / actualizar / borrar |
|---------|----------------|----------------------------------|
| Categorías | `GET/POST /categories/` | `GET/PUT/PATCH/DELETE /categories/{id}/` |
| Entradas | `GET/POST /entries/` | `GET/PUT/PATCH/DELETE /entries/{id}/` |
| Salud de contraseña | `GET/POST /password-health/` | `GET/PUT/PATCH/DELETE /password-health/{id}/` |

Los datos se filtran por el usuario del token: cada usuario solo ve lo suyo.

## Código ya preparado en `mobile/`

- `src/services/api.js` — cliente Axios, `baseURL`, timeout, `setAuthToken`.
- `src/services/authService.js` — login (guarda token si viene `access`), logout, perfil.
- `src/services/categoryService.js`, `vaultEntryService.js`, `passwordHealthService.js` — CRUD.
- `src/services/index.js` — reexporta servicios.

Ejemplo mínimo:

```javascript
import { authService, categoryService, setAuthToken } from "../services";

await authService.login({ username: "demo", password: "Demo12345!" });
const categorias = await categoryService.list();
```

## CORS

El backend incluye `django-cors-headers` para desarrollo. Si en producción restringes orígenes, añade ahí el origen del front (Expo web, etc.).

## Checklist demo (miércoles)

1. Levantar stack: `docker compose up -d` (MySQL + backend).
2. Abrir Swagger → login con `demo` → Authorize con `access`.
3. Crear categoría → crear entrada asociada → listar → editar → borrar (o el orden que prefieras).
4. En móvil: definir `EXPO_PUBLIC_API_URL` si no usas emulador con `10.0.2.2` / `localhost`.

## Pendientes típicos (fuera de esta demo)

- Registro de usuarios, recuperación de contraseña, rotación de refresh en cliente.
- Cifrado real del campo `encrypted_secret` y política de contraseña maestra.
- Endpoints de generación de contraseña y detección de debilidad/repetición (la tabla `PasswordHealth` ya existe como soporte).
