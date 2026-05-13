# SeniorWatch Cloud Backend
# Asteapta artefactul JAR construit de Balan Dan (Spring Boot)
# Build: mvn clean package -DskipTests din folderul backend/
# Artefact asteptat: backend/target/seniorwatch-cloud.jar

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiere JAR (construit de Maven inainte de docker build)
COPY backend/target/seniorwatch-cloud.jar app.jar

# Port expus (mapat de Elastic Beanstalk)
EXPOSE 8080

# JVM flags: memorie redusa pentru t3.small (2 GB RAM)
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
