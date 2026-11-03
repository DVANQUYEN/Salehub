# SalesHub - B2B IT Sales Management Platform

## 📋 Overview

SalesHub is a comprehensive backend API platform built for B2B IT sales teams. It helps organizations manage customers, track deal pipelines, generate quotes and proposals, monitor sales activities, and gain insights through analytics. Designed for IT solution providers, SalesHub supports products and services such as cloud infrastructure, cybersecurity, networking, software licensing, and hardware procurement.

## 🏗️ Architecture

- **Backend:** ExpressJS (Node.js 18)
- **Database:** PostgreSQL 15
- **ORM:** Prisma 5
- **Authentication:** JWT + Role-based access control (RBAC)
- **API Documentation:** Swagger / OpenAPI
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Reverse Proxy:** Nginx

## ✨ Features

- 🔐 **Authentication & Authorization** — JWT-based auth with ADMIN, SALES, and CUSTOMER roles.
- 👥 **Customer Relationship Management (CRM)** — Manage customer lifecycles from lead to closed.
- 📦 **Product/Service Catalog** — IT solutions catalog with categories and specifications.
- 📊 **Sales Pipeline Management** — Kanban-style deal stages from lead to closed won/lost.
- 💰 **Quote/Proposal Generator** — Create and track quotes linked to deals.
- 📈 **Dashboard & Analytics** — Sales metrics and performance overview.
- 🔔 **Activity Tracking** — Log calls, emails, and meetings against deals.
- 🐳 **Docker-ready Deployment** — Run the entire stack with Docker Compose.

## 🛠️ Tech Stack

| Technology      | Version  |
| --------------- | -------- |
| Node.js         | 18.x     |
| Express         | 5.x      |
| PostgreSQL      | 15.x     |
| Prisma          | 5.x      |
| jsonwebtoken    | 9.x      |
| bcryptjs        | 3.x      |
| express-validator | 7.x    |
| Helmet          | 8.x      |
| Winston         | 3.x      |
| Jest            | 30.x     |
| Supertest       | 7.x      |

## 📁 Project Structure

```
SalesHub/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── nginx/
│   └── nginx.conf          # Nginx reverse proxy config
├── prisma/
│   ├── schema.prisma       # Prisma data model
│   └── seed.js             # Database seed script
├── src/
│   ├── app.js              # Express application entry point
│   ├── config/             # Database & Swagger configuration
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Auth, validation & error middlewares
│   ├── routes/             # API route definitions
│   ├── utils/              # Logger & helper functions
│   └── validators/         # Request validators
├── tests/                  # Jest test suite
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or Docker)
- npm or yarn
- Docker & Docker Compose (optional, recommended)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd saleshub
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

4. Set up the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Seed sample data (optional):

```bash
npx prisma db seed
```

6. Start the development server:

```bash
npm run dev
```

The server will run at `http://localhost:3000`.

### Run Full Stack

```bash
# Terminal 1 - Backend
cd E:\QLKH
npm run dev

# Terminal 2 - Frontend  
cd E:\QLKH\frontend
npm run dev
```

Backend: http://localhost:3000
Frontend: http://localhost:5173
Swagger: http://localhost:3000/api-docs

### Environment Variables

| Variable         | Description                              | Example                                                |
| ---------------- | ---------------------------------------- | ------------------------------------------------------ |
| `NODE_ENV`       | Application environment                  | `development`                                          |
| `PORT`           | Port the server listens on               | `3000`                                                 |
| `DATABASE_URL`   | PostgreSQL connection string             | `postgresql://user:password@localhost:5432/salehub`    |
| `JWT_SECRET`     | Secret key for signing JWT tokens        | `your-super-secret-jwt-key`                            |
| `JWT_EXPIRES_IN` | JWT token expiration time                | `7d`                                                   |
| `LOG_LEVEL`      | Winston log level                        | `info`                                                 |

### Running with Docker (Recommended)

1. Build and start all services:

```bash
docker-compose up -d
```

2. Run database migrations:

```bash
docker-compose exec app npx prisma migrate deploy
```

3. Seed the database:

```bash
docker-compose exec app npx prisma db seed
```

4. Access the API at `http://localhost:3000`.

### Running Locally

```bash
# Development with hot reload
npm run dev

# Production start
npm start

# Run tests
npm test

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## 📖 API Documentation

Swagger UI is available at:

```
http://localhost:3000/api-docs
```

The main API base path is `/api`.

### Authentication Guide

Most endpoints require a Bearer token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer <your-jwt-token>" http://localhost:3000/api/products
```

## 🔐 Authentication

### How to Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Sales User","email":"sales@example.com","password":"password123"}'
```

### How to Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sales@example.com","password":"password123"}'
```

### Token Usage

Use the returned `token` in the `Authorization` header for protected routes.

### Roles Explanation

- `ADMIN` — Full access to users, products, customers, deals, quotes, and dashboard.
- `SALES` — Can manage own deals, quotes, customers, and view products.
- `CUSTOMER` — Limited access to own customer record and related deals/quotes.

## 📊 API Endpoints Summary

| Method | Path                      | Description                        | Auth Required |
| ------ | ------------------------- | ---------------------------------- | ------------- |
| GET    | `/health`                 | Health check                       | No            |
| POST   | `/api/auth/register`      | Register a new user                | No            |
| POST   | `/api/auth/login`         | Login and receive JWT              | No            |
| GET    | `/api/auth/me`            | Get current user                   | Yes           |
| PUT    | `/api/auth/change-password` | Change password                  | Yes           |
| GET    | `/api/users`              | List users                         | Yes (Admin)   |
| GET    | `/api/products`           | List products                      | Yes           |
| POST   | `/api/products`           | Create product                     | Yes (Admin)   |
| GET    | `/api/products/:id`       | Get product by ID                  | Yes           |
| PUT    | `/api/products/:id`       | Update product                     | Yes (Admin)   |
| DELETE | `/api/products/:id`       | Delete product                     | Yes (Admin)   |
| GET    | `/api/customers`          | List customers                     | Yes           |
| POST   | `/api/customers`          | Create customer                    | Yes           |
| GET    | `/api/customers/:id`      | Get customer by ID                 | Yes           |
| PUT    | `/api/customers/:id`      | Update customer                    | Yes           |
| DELETE | `/api/customers/:id`      | Delete customer                    | Yes           |
| GET    | `/api/deals`              | List deals                         | Yes           |
| POST   | `/api/deals`              | Create deal                        | Yes           |
| GET    | `/api/deals/:id`          | Get deal by ID                     | Yes           |
| PUT    | `/api/deals/:id`          | Update deal                        | Yes           |
| DELETE | `/api/deals/:id`          | Delete deal                        | Yes           |
| GET    | `/api/quotes`             | List quotes                        | Yes           |
| POST   | `/api/quotes`             | Create quote                       | Yes           |
| GET    | `/api/quotes/:id`         | Get quote by ID                    | Yes           |
| PUT    | `/api/quotes/:id`         | Update quote                       | Yes           |
| DELETE | `/api/quotes/:id`         | Delete quote                       | Yes           |
| GET    | `/api/activities`         | List activities                    | Yes           |
| POST   | `/api/activities`         | Create activity                    | Yes           |
| GET    | `/api/dashboard`          | Dashboard analytics                | Yes           |

## 🎨 Frontend

### Tech Stack
- **React 18** + **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **React Router** - Client-side routing
- **React Hook Form** - Form validation
- **Recharts** - Charts & data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Pages
| Page | Mô tả |
|------|--------|
| Login / Register / Forgot Password | Authentication pages |
| Dashboard | Stats cards, charts (monthly revenue, pipeline), recent deals |
| Products | List, search, filter, CRUD (Admin) |
| Customers | CRM list, search, filter by status, CRUD |
| Deals | List view + Kanban board (drag & drop), CRUD |
| Quotes | List, create with dynamic items, PDF download, status workflow |
| Files | Drag & drop upload, download, delete |
| Users (Admin) | User management, edit, toggle active |
| Profile | User info, change password |

### Frontend Features
- ✅ Responsive design (mobile-friendly)
- ✅ Role-based UI (Admin/SALES/CUSTOMER see different menus)
- ✅ Dark mode ready (TailwindCSS)
- ✅ Real-time notifications (Socket.IO)
- ✅ Form validation (React Hook Form)
- ✅ Drag & drop Kanban board
- ✅ PDF download for quotes
- ✅ File upload with drag & drop
- ✅ Charts & analytics (Recharts)
- ✅ Protected routes
- ✅ Loading states & error handling

### Run Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Build Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

## 🧪 Testing

Run the test suite with:

```bash
npm test
```

Tests cover:

- Health check endpoint
- Unknown route handling
- Authentication endpoints (register, login)
- Product listing endpoints

## 🐳 Docker Deployment

The current `docker-compose.yml` runs the backend API, PostgreSQL, and Nginx. The frontend is developed and built separately with Vite.

### Development

```bash
docker-compose up
```

> **Frontend in Docker:** To also serve the frontend via Docker, build the production assets first (`cd frontend && npm run build`) and update `nginx/nginx.conf` to point to `frontend/dist/` as static files, or add a dedicated `frontend` service to `docker-compose.yml`.

### Production

```bash
docker-compose -f docker-compose.yml up -d --build
```

### Environment Configuration

Create a `.env` file in the project root with production values. Docker Compose will inject these into the containers.

Example:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://salehub:salehub_password@db:5432/salehub
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
POSTGRES_USER=salehub
POSTGRES_PASSWORD=salehub_password
POSTGRES_DB=salehub
```

## 🔄 CI/CD

The project uses GitHub Actions for continuous integration and deployment.

### CI Workflow (`.github/workflows/ci.yml`)

Triggered on push and pull requests to `main`:

1. Installs Node.js 18 and dependencies.
2. Generates the Prisma client.
3. Runs lint if configured.
4. Runs the Jest test suite.
5. Builds the Docker image and verifies it starts.

### Deploy Workflow (`.github/workflows/deploy.yml`)

Triggered on push to `main` or manually via `workflow_dispatch`:

1. Connects to the production server via SSH.
2. Pulls the latest code.
3. Rebuilds and restarts containers with Docker Compose.
4. Applies pending Prisma migrations.

Configure the following GitHub secrets for deployment:

- `SERVER_HOST`
- `SERVER_USERNAME`
- `SERVER_SSH_KEY`

## 📝 Database

### Prisma Schema Overview

Key models:

- `User` — System users with roles.
- `Product` — IT products and services catalog.
- `Customer` — B2B customers.
- `Deal` — Sales opportunities with stages and values.
- `Quote` — Proposals linked to deals.
- `Activity` — Calls, emails, and meetings.

### Migration Commands

```bash
# Development migration
npx prisma migrate dev --name <migration-name>

# Deploy migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Seed Data

Seed the database with an admin user, sample products, customers, deals, and quotes:

```bash
npx prisma db seed
```

Default admin credentials:

- Email: `admin@salehub.com`
- Password: `Admin@123`

## 🔒 Security

- **JWT Authentication** — Stateless token-based authentication.
- **Password Hashing** — Passwords are hashed with bcrypt (12 rounds).
- **RBAC** — Role-based access control restricts endpoints by user role.
- **Input Validation** — express-validator validates incoming requests.
- **SQL Injection Prevention** — Prisma ORM uses parameterized queries.
- **Security Headers** — Helmet.js sets secure HTTP headers.
- **CORS** — Configurable cross-origin resource sharing.
- **Nginx Headers** — Additional security headers and gzip compression in production.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure tests pass and follow the existing code style.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

SalesHub Team

- Email: contact@salehub.com
- Website: https://salehub.com
