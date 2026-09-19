/**
 * Monitor de actividad del usuario.
 *
 * Registra la última interacción (mouse, teclado, clic, scroll, touch) y la
 * comparte entre pestañas del mismo origen mediante localStorage, de modo que
 * la actividad en cualquier pestaña mantiene viva la sesión en todas.
 */
export const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "click",
  "scroll",
  "touchstart",
  "wheel",
];

const LAST_ACTIVITY_KEY = "lastActivityAt";
/** Mínimo intervalo entre escrituras (evita saturar localStorage con mousemove). */
const TOUCH_THROTTLE_MS = 1_000;

/** Tiempo máximo de inactividad antes de cerrar la sesión (por defecto 3 minutos). */
export const INACTIVITY_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS) || 3 * 60_000;
/** Antelación con la que se muestra el aviso de cierre inminente. */
export const INACTIVITY_WARNING_MS = Number(process.env.NEXT_PUBLIC_INACTIVITY_WARNING_MS) || 30_000;

export class ActivityMonitor {
  private static lastTouchWrite = 0;
  private static lastActivityMemory = Date.now();

  /** Marca actividad ahora mismo. */
  static touch(force = false): void {
    const now = Date.now();
    this.lastActivityMemory = now;
    if (!force && now - this.lastTouchWrite < TOUCH_THROTTLE_MS) return;
    this.lastTouchWrite = now;
    try {
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    } catch {
      /* almacenamiento no disponible: se usa el valor en memoria */
    }
  }

  /** Última actividad conocida (epoch ms), considerando otras pestañas. */
  static getLastActivity(): number {
    try {
      const stored = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY));
      if (stored && stored > this.lastActivityMemory) return stored;
    } catch {
      /* ignorar */
    }
    return this.lastActivityMemory;
  }

  /** Milisegundos transcurridos desde la última actividad. */
  static getIdleMs(): number {
    return Math.max(0, Date.now() - this.getLastActivity());
  }

  /** Milisegundos restantes antes del cierre por inactividad. */
  static getRemainingMs(): number {
    return Math.max(0, INACTIVITY_TIMEOUT_MS - this.getIdleMs());
  }

  static reset(): void {
    this.lastActivityMemory = Date.now();
    this.lastTouchWrite = 0;
    try {
      window.localStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch {
      /* ignorar */
    }
  }

  /** Suscribe los listeners de actividad; devuelve la función para removerlos. */
  static subscribe(onActivity?: () => void): () => void {
    const handler = () => {
      this.touch();
      onActivity?.();
    };
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handler, { passive: true }));
    this.touch(true);
    return () => ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handler));
  }
}
