# agileXpertTask

Smart device operating system domain model with a Spring Boot backend, React + React Query + MUI frontend, and PostgreSQL in Docker.

## Backend

Run the database first:

```bash
docker compose up -d --force-recreate postgres
```

PostgreSQL is exposed on `localhost:5433` to avoid conflicts with any local Postgres already using `5432`.

Then start the backend from the project root:

```bash
mvn spring-boot:run
```

Backend base URL: `http://localhost:8080`

## Frontend

Install UI dependencies and start Vite from the `ui` folder:

```bash
cd ui
npm install
npm run dev
```

Frontend base URL: `http://localhost:5173`

## Demo data

The backend seeds default demo data on startup and exposes a simulation endpoint at `POST /api/dashboard/simulate`.
