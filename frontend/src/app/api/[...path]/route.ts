import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Permitir únicamente las rutas de autenticación y productos.
  const allowedPath =
    /^\/api\/(auth\/(login|me|refresh|logout)|products(?:\/\d+)?)$/;

  if (!allowedPath.test(path)) {
    return Response.json(
      {
        success: false,
        message: "Ruta no encontrada",
        data: null,
      },
      { status: 404 }
    );
  }

  try {
    // Esta variable solo se utiliza en el servidor.
    const backendUrl = new URL(
      process.env.BACKEND_URL || "http://localhost:8080"
    );

    backendUrl.pathname = path;
    backendUrl.search = request.nextUrl.search;

    const headers = new Headers();

    for (const name of [
      "authorization",
      "content-type",
      "accept",
    ]) {
      const value = request.headers.get(name);

      if (value) {
        headers.set(name, value);
      }
    }

    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });

    // Evitar redirecciones que expongan la dirección interna.
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();

      return Response.json(
        {
          success: false,
          message: "Respuesta inesperada del servicio",
          data: null,
        },
        { status: 502 }
      );
    }

    const responseHeaders = new Headers({
      "Cache-Control": "no-store",
    });

    for (const name of [
      "content-type",
      "www-authenticate",
      "allow",
    ]) {
      const value = response.headers.get(name);

      if (value) {
        responseHeaders.set(name, value);
      }
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "El servicio no está disponible. Inténtalo de nuevo.",
        data: null,
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

export {
  proxy as GET,
  proxy as HEAD,
  proxy as POST,
  proxy as PUT,
  proxy as DELETE,
};