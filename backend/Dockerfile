# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Descargar dependencias aprovechando la capa y el cache mount de BuildKit
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B || true

# Copiar código fuente y compilar empaquetando el jar sin tests
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Crear usuario y grupo sin privilegios
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar el jar generado con los permisos adecuados
COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

USER appuser

EXPOSE 8080

# Flags JVM recomendadas para contenedores
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+ExitOnOutOfMemoryError", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]

