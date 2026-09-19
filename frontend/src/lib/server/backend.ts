// Utilidades SOLO de servidor: la URL real del backend nunca llega al navegador.
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "content-encoding",
  "set-cookie",
]);

// Únicos headers del cliente que se reenvían (Authorization/Cookie jamás).
const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "accept-language"];

export function backendBaseUrl(): string {
  return (process.env.BACKEND_URL || "http://backend:8080").replace(/\/+$/, "");
}

/** Devuelve la URL destino bajo /api/ o null si el path es sospechoso. */
export function buildBackendUrl(segments: string[], search: string): string | null {
  const safe: string[] = [];
  for (const raw of segments) {
    let seg: string;
    try {
      seg = decodeURIComponent(raw);
    } catch {
      return null;
    }
    if (!seg || seg === "." || seg === ".." || /[\/\?#\0]/.test(seg)) return null;
    safe.push(encodeURIComponent(seg));
  }
  if (safe.length === 0) return null;
  return `${backendBaseUrl()}/api/${safe.join("/")}${search}`;
}

export function forwardRequestHeaders(incoming: Headers, accessToken?: string): Headers {
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = incoming.get(name);
    if (value) headers.set(name, value);
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  return headers;
}

export function filterResponseHeaders(upstream: Headers): Headers {
  const headers = new Headers();
  upstream.forEach((value, name) => {
    if (!HOP_BY_HOP.has(name.toLowerCase())) headers.set(name, value);
  });
  return headers;
}
