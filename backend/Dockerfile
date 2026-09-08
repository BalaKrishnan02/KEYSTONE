FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/mvnw .
COPY backend/.mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY backend/src src
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
