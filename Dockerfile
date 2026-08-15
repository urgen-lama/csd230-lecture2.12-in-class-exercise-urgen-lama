# --- STAGE 1: Build the React Frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Vite compiles React directly into ../src/main/resources/static
RUN npm run build

# --- STAGE 2: Build the Spring Boot Backend ---
FROM maven:3.9-eclipse-temurin-25-alpine AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Pull in the compiled static frontend assets from Stage 1
COPY --from=frontend-build /app/src/main/resources/static ./src/main/resources/static
# Build the executable JAR and skip tests (handled by our CI pipeline)
RUN mvn clean package -DskipTests

# --- STAGE 3: Final Production Runtime ---
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar

# Limit Java memory to prevent Free Tier container termination
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
