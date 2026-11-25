# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copiar configuración de Maven y cachear dependencias
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Compilar el artefacto sin ejecutar pruebas (los tests ya se validan en CI)
COPY src/main src/main
RUN ./mvnw clean package -Dmaven.test.skip=true

# Etapa de ejecución liviana
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
