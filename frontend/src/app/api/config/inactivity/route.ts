const DEFAULT_INACTIVITY_TIMEOUT_MS = 180_000;
const MIN_INACTIVITY_TIMEOUT_MS = 10_000;
const MAX_INACTIVITY_TIMEOUT_MS = 86_400_000;

function getInactivityTimeoutMs(): number {
  const configuredTimeout = Number(process.env.INACTIVITY_TIMEOUT_MS);

  if (
    Number.isInteger(configuredTimeout) &&
    configuredTimeout >= MIN_INACTIVITY_TIMEOUT_MS &&
    configuredTimeout <= MAX_INACTIVITY_TIMEOUT_MS
  ) {
    return configuredTimeout;
  }

  return DEFAULT_INACTIVITY_TIMEOUT_MS;
}

export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(
    { timeoutMs: getInactivityTimeoutMs() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
