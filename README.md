# ⚡ KEYSTONE — Field Service Management Platform

KEYSTONE is an enterprise-grade Field Service Management (FSM) platform designed to streamline work order tracking, field engineer dispatching, customer management, inventory/parts tracking, SLA monitoring, and operational analytics.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, Recharts
- **Backend**: Java 17, Spring Boot 3, Spring Security, JWT Authentication, Spring Data JPA, Flyway Migrations
- **Database**: PostgreSQL (Production / Cloud) / In-Memory H2 (Local Development & Testing)
- **Containerization & Deployment**: Docker, Docker Compose, Nginx

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Java JDK 17+

### Option A: Run with In-Memory H2 (Zero Database Setup Required)

1. **Start Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run "-Dspring-boot.run.profiles=h2"
   ```
   *The backend will be live at `http://localhost:8080` with Swagger UI at `http://localhost:8080/swagger-ui.html`.*

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend will be live at `http://localhost:5173`.*

### Option B: Run with PostgreSQL via Docker

```bash
docker compose up --build
```
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`

---

## 🔑 Default Login Personas

| Role | Email | Password |
|---|---|---|
| **Admin / Field Service Director** | `admin@vertexa.com` | `password123` |
| **Dispatcher / Operations Lead** | `sarah.chen@vertexa.com` | `password123` |
| **Field Technician** | `marcus.rodriguez@vertexa.com` | `password123` |
| **Inventory Manager** | `elena.rostova@vertexa.com` | `password123` |

---

## 🌐 Deploying & Hosting on the Internet

### 1. Database (Cloud PostgreSQL)
- Create a free PostgreSQL database on [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com).
- Copy the JDBC URL: `jdbc:postgresql://<HOST>:5432/<DB>?sslmode=require`.

### 2. Backend (Render / Railway / Cloud)
Set the following environment variables:
- `DB_URL`: `jdbc:postgresql://<HOST>:5432/<DB>?sslmode=require`
- `DB_USERNAME`: `<db_user>`
- `DB_PASSWORD`: `<db_password>`
- `SPRING_PROFILES_ACTIVE`: `default`
- `JWT_SECRET`: `<secure-random-secret-key>`
- `CORS_ALLOWED_ORIGINS`: `https://<your-frontend-domain>.vercel.app`

### 3. Frontend (Vercel / Netlify / Cloudflare Pages)
Set the build environment variable:
- `VITE_API_BASE_URL`: `https://<your-backend-domain>.onrender.com/api`

---

## 📁 Repository Structure

```
├── backend/                  # Spring Boot 3 Backend
│   ├── src/main/java/        # Controllers, Services, Repositories, Entities, Security
│   ├── src/main/resources/   # Config (application.yml) & Flyway SQL Migrations
│   └── pom.xml               # Maven configuration & dependencies
├── frontend/                 # Vite + React + TypeScript Frontend
│   ├── src/                  # Components, Pages, Contexts, Hooks, Services
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml        # Multi-container orchestration
├── .env.example              # Environment variables template
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.
