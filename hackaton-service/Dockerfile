FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn -B -pl hackaton-service -am -DskipTests package
RUN cp hackaton-service/target/*.jar /app/app.jar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/app.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
