# Stage 1: Build the application
FROM public.ecr.aws/docker/library/maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Prefetch dependencies to speed up subsequent builds
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Create the runtime image
FROM public.ecr.aws/docker/library/eclipse-temurin:17-jre
WORKDIR /app
# Copy the built JAR from the builder stage
COPY --from=build /app/target/krishidrishti-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]