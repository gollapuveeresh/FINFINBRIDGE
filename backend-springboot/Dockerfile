# Build stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and fetch dependencies (enables caching of dependencies)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build package
COPY src ./src
RUN mvn clean package -DskipTests -B

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/finbridge-backend-1.0.0.jar app.jar

# Expose the port defined in application.yml (5000)
EXPOSE 5000

# Execute the application
ENTRYPOINT ["java", "-jar", "app.jar"]
