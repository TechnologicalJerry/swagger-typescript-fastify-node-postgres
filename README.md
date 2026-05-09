# Fastify TypeScript PostgreSQL API

![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A production-ready, enterprise-grade REST API backend built with Fastify, TypeScript, PostgreSQL (via Prisma ORM), and Zod validation.

## 🚀 Features

- **Fastify Framework**: High-performance backend routing and middleware execution.
- **Type Safety End-to-End**: Fully written in strict TypeScript.
- **Prisma ORM**: Modern database access with `@prisma/adapter-pg` for PostgreSQL.
- **Zod Validation**: Robust schema validation for inputs and outputs seamlessly integrated with `fastify-type-provider-zod`.
- **JWT Authentication**: Secure stateless authentication with Access and Refresh tokens.
- **Swagger / OpenAPI 3.0**: Automatically generated, interactive API documentation.
- **Dockerized**: Easy to spin up using Docker Compose.
- **Security Best Practices**: Rate limiting, CORS, and Helmet configured out-of-the-box.

## 📁 Project Structure

```text
src/
├── app.ts                 # Fastify app factory and plugin registration
├── server.ts              # Server entry point and graceful shutdown
├── config/
│   └── env.ts             # Zod-validated environment variables
├── plugins/
│   ├── auth.ts            # JWT Auth plugin
│   ├── db.ts              # Prisma database connection
│   └── swagger.ts         # Swagger OpenAPI docs configuration
├── modules/
│   ├── auth/              # Authentication routes and logic
│   └── users/             # User management routes and logic
├── middlewares/
│   └── errorHandler.ts    # Global centralized error handling
└── utils/
    ├── password.ts        # Bcrypt hashing wrappers
    └── response.ts        # Standardized API response formatters
```

## 🛠️ Prerequisites

- **Node.js** (v18+ recommended)
- **Docker** & **Docker Compose**

## 🚦 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/TechnologicalJerry/swagger-typescript-fastify-node-postgres.git
cd swagger-typescript-fastify-node-postgres
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (you can copy `.env.example`):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fastify_api?schema=public"
JWT_SECRET="supersecret_jwt_key_change_in_production_123456789"
```

### 3. Run with Docker (Recommended)
You can bring up the entire stack (PostgreSQL + Fastify API) with one command:
```bash
docker compose up --build
```
*Note: The docker-compose configuration will automatically run Prisma migrations and start the application.*

### 4. Local Development
If you prefer running the app locally without Docker for the API:

Start a local PostgreSQL instance (or use Docker for just the DB):
```bash
docker compose up db -d
```

Run database migrations:
```bash
npm run db:migrate
```

Seed the database with an initial Admin user:
```bash
npm run db:seed
```

Start the development server:
```bash
npm run dev
```

## 📚 API Documentation

Once the server is running, the interactive Swagger UI is available at:
👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

From there, you can view all available endpoints, required payloads, and test the API directly from your browser. 
**Note:** To test secured endpoints, first hit the `/api/v1/auth/login` endpoint (using the seeded admin credentials: `admin@example.com` / `admin123`) to get a Bearer token, and enter it using the "Authorize" button in Swagger UI.

## 📜 Available Scripts

- `npm run dev`: Starts the development server using `tsx`.
- `npm run build`: Compiles TypeScript to JavaScript in the `/dist` folder.
- `npm start`: Runs the built server.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run db:migrate`: Applies Prisma migrations to the database.
- `npm run db:seed`: Seeds the database with default data.

## 🛡️ License

This project is licensed under the ISC License.