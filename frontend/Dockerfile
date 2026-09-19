# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js en build
ENV NEXT_TELEMETRY_DISABLED=1

# Parámetros de cierre por inactividad (se incrustan en el bundle del cliente)
ARG NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS=180000
ARG NEXT_PUBLIC_INACTIVITY_WARNING_MS=30000
ENV NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS=${NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS}
ENV NEXT_PUBLIC_INACTIVITY_WARNING_MS=${NEXT_PUBLIC_INACTIVITY_WARNING_MS}

RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# URL interna del backend usada por el proxy (BFF) en tiempo de ejecución.
# No se expone al navegador; se sobreescribe desde docker-compose.
ENV BACKEND_URL=http://localhost:8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos generados en standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
