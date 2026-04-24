# 🚗 Wasel Palestine - Smart Mobility API

## 📌 Overview

Wasel Palestine is a backend RESTful API platform designed to support mobility intelligence in Palestine. The system provides structured and real-time information about checkpoints, road incidents, user reports, and route estimation.

The platform aggregates data and exposes it through versioned APIs that can be consumed by mobile applications, web dashboards, or third-party systems.

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MySQL (Relational Database)
* Sequelize ORM + Raw Queries
* JWT Authentication (Access + Refresh Tokens)
* OpenStreetMap API
* OpenWeather API
* API-Dog (API Documentation & Testing)
* k6 (Performance & Load Testing)
* Docker & Docker Compose

---

## 🏗️ Architecture

The system follows a **layered architecture**:

* **Controller Layer** → Handles HTTP requests and responses
* **Service Layer** → Contains business logic
* **Repository Layer** → Handles database operations
* **External Services Layer** → Integrates with APIs

### Why this architecture?

* Separation of concerns
* Scalability
* Maintainability
* Easier testing and debugging

---

## 🗄️ Database Design

### Core Entities

User, Role, Report, Duplicate Report, Moderation Actions, Checkpoints, Status History, Incidents, Type, Route Request, Route Result, Route Constraint Type, Route Request Constraint, Alert Subscription, Alert Record, Area

### Key Features

* Users can create reports
* Reports support voting and duplication detection
* Moderation actions are fully tracked
* Checkpoints maintain historical status
* Routes support constraints
* Alerts triggered by incidents

---

## 📊 Database ERD

![Database ERD](./docs/a1.png)

---

## 🔗 API Design

Base URL:

```bash
/api/v1/
```
## 🧠 API Design Rationale

The API follows RESTful principles to ensure scalability and maintainability.

- Versioning (/api/v1) enables backward compatibility
- Resource-based endpoints improve clarity
- HTTP methods used correctly:
  - GET → fetch data
  - POST → create resources
  - PATCH → partial updates
  - DELETE → remove resources
- Separation between resources and actions improves design clarity

  
### Example Endpoints

#### Reports

* POST `/reports`
* GET `/reports`
* GET `/reports/:id`
* POST `/reports/:id/vote`
* DELETE `/reports/:id/vote`

#### Moderation

* PATCH `/reports/{id}/verify`
* PATCH `/reports/{id}/reject`
* PATCH `/reports/{id}/close`
* PATCH `/reports/{id}/mark-duplicate`

#### Routes

* POST `/routes/estimate`
* POST `/routes/{id}/calculate`
* GET `/routes/{id}`

---

## 🔐 Authentication & Security

* JWT (Access + Refresh Tokens)
* Role-based access control
* Password hashing (bcrypt)
* Input validation & error handling
* CORS enabled

---

## 🌍 External API Integration Details

### OpenStreetMap
Used for route estimation and geolocation.

Handled:
- Request timeouts
- Error handling (fallback responses)
- Data transformation into internal format

### OpenWeather API
Used to enhance incident context based on weather.

Handled:
- API authentication
- Rate limiting protection
- Basic caching to reduce repeated calls

---

## 🧪 API Documentation

All APIs documented using **API-Dog**:

* Request/response schemas
* Auth flows
* Testing scenarios

---

## ⚡ Performance & Load Testing (k6)

### Test Scenarios

| Scenario | Load | Duration |
|---|---|---|
| Read-heavy | 20 VUs | 1 min |
| Write-heavy | 40 VUs | 5 min |
| Mixed | 50 VUs | 5 min |
| Spike | 100 VUs | 3 min |
| Soak | 20 VUs | 15 min |

---

### Results Summary

| Scenario | Avg | p95 | Throughput | Error |
|---|---|---|---|---|
| Read-heavy | 7.41 ms | 14.52 ms | 19.77 req/s | 0% |
| Mixed | 286 ms | 983 ms | 38.75 req/s | 0% |
| Write-heavy | 137 ms | 99 ms | 20.95 req/s | 93.97% |
| Spike | 7.62 ms | 17.98 ms | 53 req/s | 0% |
| Soak | 5.69 ms | 13.81 ms | 9.96 req/s | 0% |

---

### Analysis

Read-heavy, spike, and soak tests show excellent performance with low latency and zero errors.

Mixed workload remains stable under concurrent operations.

However, write-heavy testing shows a high failure rate.

---

### Root Cause Analysis

- Duplicate detection rejects repeated requests
- k6 uses identical payloads
- High concurrent insert operations

---

### Bottlenecks

- Database writes are expensive
- Duplicate detection adds overhead
- No unique payload generation in testing

---

### Improvements

- Generate dynamic test data
- Add indexing on frequently used columns
- Optimize duplicate detection queries
- Introduce caching for external APIs

---

### Before / After

Initial testing showed high failure in write-heavy scenarios.

Analysis identified duplicate handling as the main issue.

Future optimizations are expected to reduce error rates significantly.
---
## 🧪 Testing Strategy

The system was tested using multiple approaches:

- API-Dog → manual endpoint testing
- Authentication testing → JWT validation
- Role-based testing → access control verification
- Input validation testing → invalid and edge cases
- Performance testing → k6 load testing

Each endpoint was validated for correctness, security, and stability.

---
## 🐳 Deployment

```bash
docker compose up --build
```

* App: http://localhost:3000
* Database: MySQL (Docker)

---

## ⚙️ Run Locally

```bash
git clone https://github.com/sondosalqu/WaselPalestine-.git
cd WaselPalestine-
npm install
npm run dev
```

---

## ⚙️ Environment Variables

Create `.env` file:

```env
DB_NAME=myDB
DB_USER=root
DB_PASSWORD=your_db_password

DB_HOST=localhost
DB_PORT=3306

PORT=3000

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## 🔁 Workflow

* Feature branches
* Pull requests
* Clean commit messages

---

## 👥 Team

* Sondos Alqotob
* Maiar Obeid
* Haya Khattabeh

---

## 📌 Notes

This project demonstrates backend system design including:

* API architecture
* Database modeling
* Authentication
* External integrations
* Performance optimization
* Containerized deployment

---
