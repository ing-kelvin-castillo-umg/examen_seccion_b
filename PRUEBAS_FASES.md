# Evidencias del examen

## Fase 2: renovación de sesión
- Access token: 60 segundos en Docker; refresh: 30 minutos absolutos.
- Refresh opaco aleatorio de 256 bits; PostgreSQL guarda solo SHA-256.
- Rotación de un solo uso y bloqueo transaccional; conserva la expiración original.
- El cliente renueva cuando quedan 10 segundos y también reintenta una sola vez tras 401.
- Las pestañas comparten un bloqueo para evitar renovaciones simultáneas.
- 401 de refresh limpia la sesión; errores transitorios permiten reintentar.
- En Network activar Preserve log (Keep log), filtrar Fetch/XHR, iniciar sesión
  y esperar unos 50 segundos. Capturar POST /api/auth/refresh con 200 y el panel
  todavía abierto. También se registra [AUTH] Refresh exitoso en consola sin tokens.
- No incluir los valores completos de tokens en el PDF.
- La persistencia en localStorage mantiene el diseño base; para producción conviene
  migrar credenciales a cookies HttpOnly y proteger las operaciones frente a CSRF.
