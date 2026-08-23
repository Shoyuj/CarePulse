# ==============================================================================
# Multi-Stage Dockerfile for Spring Boot Backend
# Compatible with Render (Free Web Service), Railway, Fly.io, Koyeb, Docker
# ==============================================================================

# Build Stage
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /workspace/app

# Copy Maven Wrapper & POM
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw
# Pre-fetch dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code and build jar
COPY src src
RUN ./mvnw clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Run as non-root user for security
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

COPY --from=builder /workspace/app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
