FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn -B -pl sound-service -am \
    -DskipTests package
RUN cp sound-service/target/*.jar /app/app.jar
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/app.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
