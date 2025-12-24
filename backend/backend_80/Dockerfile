# Stage 0: Base with rasp-platform artifacts
FROM 172.16.202.56:5000/rasp-platform-jar:latest AS rasp-base

# Stage 1: Build the application
FROM maven:3.9.8-eclipse-temurin-22 AS build

WORKDIR /app

# Copy rasp-platform subtree into Maven local repo
COPY --from=rasp-base /app/rasp-platform /root/.m2/repository/rasp-platform/rasp-platform

# Copy pom.xml and download deps (should resolve rasp-platform from local .m2)
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy the rest of the sources
COPY src ./src

# Build the app
RUN mvn clean install -DskipTests

# Stage 2: Run the application
FROM openjdk:22-jdk-slim AS run

WORKDIR /app

COPY --from=build /app/target/*.jar ./app.jar
COPY --from=build /app/pom.xml /app/rasp_backend/pom.xml
COPY --from=build /app/src     /app/rasp_backend/src

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
