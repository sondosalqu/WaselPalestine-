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

## 🌍 External APIs

* OpenStreetMap → routing & geolocation
* OpenWeather → weather data

---

## 🧪 API Documentation

All APIs documented using **API-Dog**:

* Request/response schemas
* Auth flows
* Testing scenarios

---

## ⚡ Performance Testing (k6)

### Test Configuration

* Virtual Users (VUs): 20
* Duration: 1 minute
* Scenario: Read-heavy

---

### Results

| Test Type  | Avg Response | p95      | Throughput  | Error |
| ---------- | ------------ | -------- | ----------- | ----- |
| Read-heavy | 9.16 ms      | 16.38 ms | 19.78 req/s | 0%    |

---

### Sample Output

✔ checks_succeeded: 100% (1200/1200)
✖ checks_failed: 0%

http_req_duration:

* avg: 9.16 ms
* p95: 16.38 ms
* max: 52.08 ms

http_req_failed: 0%

---

### Analysis

* Sub-10ms average latency
* Stable response times
* Zero failed requests
* Efficient under concurrent load

---

### Performance Justification

The strong performance results are influenced by:

* Layered architecture separation
* Optimized queries (Sequelize + raw SQL)
* Pagination & filtering

This contributed to low latency and high stability.

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
