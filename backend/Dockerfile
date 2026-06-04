# Use Java 21 with Maven pre-installed
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

# Set working directory
WORKDIR /app

# Copy pom.xml first — Docker caches this layer
# If pom.xml hasn't changed, dependencies are not re-downloaded
COPY pom.xml .

# Download all dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build the JAR — skip tests for faster build
RUN mvn clean package -DskipTests

# ── Second stage — smaller final image ──
# We built the JAR in the first stage.
# Now we only copy the JAR into a clean Java runtime image.
# This makes the final image much smaller (no Maven, no source code).
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy only the JAR from the build stage
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]