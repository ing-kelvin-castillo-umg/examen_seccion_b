/**
 * Política de inactividad (Fase 3). Configurable por variable de entorno
 * (debe ser NEXT_PUBLIC_* porque se lee en el navegador, no en el servidor;
 * a diferencia de BACKEND_URL, no revela nada sensible) con valores por
 * defecto sensatos para la evaluación del examen.
 */

// Tiempo total de inactividad antes del logout automático.
export const INACTIVITY_LOGOUT_MS = Number(process.env.NEXT_PUBLIC_INACTIVITY_LOGOUT_MS) || 120_000; // 2 minutos

// Momento (desde el inicio de la inactividad) en que se muestra el aviso
// con cuenta regresiva. Debe ser menor que INACTIVITY_LOGOUT_MS.
export const INACTIVITY_WARNING_MS = Number(process.env.NEXT_PUBLIC_INACTIVITY_WARNING_MS) || 90_000; // 90 segundos
