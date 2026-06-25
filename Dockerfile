# Stage 1: Build the application
FROM public.ecr.aws/docker/library/maven:3.8.6-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
# Prefetch dependencies to speed up subsequent builds
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Create the runtime image
FROM public.ecr.aws/docker/library/openjdk:17-slim
WORKDIR /app
# Copy the built JAR from the builder stage
COPY --from=build /app/target/krishidrishti-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]