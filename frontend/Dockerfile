# Stage 1: Dependencies (Bun 1.4)
FROM oven/bun:1.4-alpine AS deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

# Stage 2: Builder (Bun 1.4)
FROM oven/bun:1.4-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js en build
ENV NEXT_TELEMETRY_DISABLED=1

# URL pública de la API durante build (vacío para usar el BFF relativo)
ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Compilar Next.js utilizando cache mount para acelerar builds repetidos
RUN --mount=type=cache,target=/app/.next/cache bun run build

# Stage 3: Runner (Node 22 LTS Alpine para estabilidad y compatibilidad oficial de Next.js)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos generados en standalone asegurando permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
