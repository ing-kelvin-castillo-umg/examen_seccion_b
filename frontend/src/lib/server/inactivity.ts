// Configuración de inactividad leída en runtime (variables de entorno del contenedor, sin rebuild).
const DEFAULT_SECONDS = 180;
const MIN_SECONDS = 120;
const MAX_SECONDS = 300;
const DEMO_MIN_SECONDS = 10;

/**
 * INACTIVITY_TIMEOUT_SECONDS: por defecto 180, rango permitido 120-300.
 * Con INACTIVITY_DEMO_MODE=true se acepta desde 10 s (solo para demostraciones).
 */
export function inactivityTimeoutSeconds(): number {
  const demo = process.env.INACTIVITY_DEMO_MODE === "true";
  const raw = Number.parseInt(process.env.INACTIVITY_TIMEOUT_SECONDS ?? "", 10);
  const value = Number.isFinite(raw) ? raw : DEFAULT_SECONDS;
  return Math.min(MAX_SECONDS, Math.max(demo ? DEMO_MIN_SECONDS : MIN_SECONDS, value));
}
