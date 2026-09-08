# Plan to Run Keystone Application Locally

## Context & Findings
1. The user's system does not have Docker or PostgreSQL installed.
2. The Spring Boot backend currently defaults to connecting to a PostgreSQL database on `localhost:5432` with Flyway migrations.
3. The Flyway migration `V1__initial_schema.sql` creates a `"uuid-ossp"` extension that is PostgreSQL-specific but never used anywhere in the schema (primary keys are `BIGSERIAL`).
4. To run the application successfully without installing PostgreSQL, we can use H2 in PostgreSQL compatibility mode.

---

## Proposed Changes

### Backend

#### [MODIFY] [pom.xml](file:///d:/open%20box/backend/pom.xml)
- Add the `com.h2database:h2` runtime dependency to make H2 available.

#### [NEW] [application-h2.yml](file:///d:/open%20box/backend/src/main/resources/application-h2.yml)
- Create a new application configuration for the `h2` profile:
  - Database URL: `jdbc:h2:mem:keystone;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDER=HIGH;DB_CLOSE_DELAY=-1`
  - JPA database-platform: `org.hibernate.dialect.H2Dialect`
  - Flyway locations: `classpath:db/migration`

#### [MODIFY] [V1__initial_schema.sql](file:///d:/open%20box/backend/src/main/resources/db/migration/V1__initial_schema.sql)
- Remove/comment out the `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` statement on line 2, which is unsupported by H2 and not used in the database schema.

---

## Execution Plan

1. **Modify Database Migrations & Config**:
   - Edit [V1__initial_schema.sql](file:///d:/open%20box/backend/src/main/resources/db/migration/V1__initial_schema.sql) to remove the unused UUID extension setup.
   - Edit [pom.xml](file:///d:/open%20box/backend/pom.xml) to add H2 dependency.
   - Write [application-h2.yml](file:///d:/open%20box/backend/src/main/resources/application-h2.yml).

2. **Run Backend**:
   - Run backend in the background using command: ./mvnw spring-boot:run "-Dspring-boot.run.profiles=h2"

3. **Install & Run Frontend**:
   - In frontend directory, run `npm install`.
   - Run frontend in the background using command: `npm run dev`.

---


## Verification Plan

### Automated Verification
- Verify backend started successfully by querying health endpoint or checking startup logs.
- Verify frontend is serving the dev app.

### Manual Verification
- Open the browser to the frontend local URL.
- Test login with default manager credentials (`admin@vertexa.com` / `password123`) to verify Flyway successfully migrated and seeded H2 database.
