# 🚗 Wasel Palestine - Smart Mobility API

## 📌 Overview

Wasel Palestine is a backend RESTful API platform designed to support mobility intelligence in Palestine. The system provides structured and real-time information about checkpoints, road incidents, user reports, and route estimation.

The platform aggregates data and exposes it through versioned APIs that can be consumed by mobile applications, web dashboards, or third-party systems.

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* Relational Database (MySQL)
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
* **External Services Layer** → Integrates with APIs (OpenStreetMap, Weather)

### Why this architecture?

* Separation of concerns
* Scalability
* Maintainability
* Easier testing and debugging

---

## 🗄️ Database Design

The system uses a relational database designed to support reporting, moderation, routing, and alerts.

### Core Entities

* User
* Role
* Report
* Duplicate Report
* Moderation Actions
* Checkpoints
* Status History
* Incidents
* Type
* Route Request
* Route Result
* Route Constraint Type
* Route Request Constraint
* Alert Subscription
* Alert Record
* Area

### Key Features

* Users can create reports
* Reports can be voted on
* Duplicate detection supported
* Moderation actions are auditable
* Checkpoints maintain history
* Routes support constraints
* Alerts triggered by incidents

---

## 📊 Database ERD

![Database ERD](./docs/erd.png)

---

## 🔗 API Design

All endpoints follow RESTful standards and are versioned:

```bash
/api/v1/...
```

### Example Endpoints

#### Reports
* `POST /api/v1/reports`
* `GET /api/v1/reports`
* `GET /api/v1/reports/:id`
* `POST /api/v1/reports/:id/vote`
* `DELETE /api/v1/reports/:id/vote`
  
#### Moderation
- `PATCH /api/v1/reports/{id}/verify` → verify report
- `PATCH /api/v1/reports/{id}/reject` → reject report
- `PATCH /api/v1/reports/{id}/close` → close report
- `PATCH /api/v1/reports/{id}/mark-duplicate` → mark report as duplicate

- `GET /api/v1/reports/{id}/moderation-actions` → get moderation history for a report
- `GET /api/v1/reports/pending` → get all pending reports

#### Incidents
- POST /api/v1/incidents
- GET /api/v1/incidents
- PUT /api/v1/incidents/:id
- PATCH /api/v1/incidents/:id/close
- PATCH /api/v1/incidents/:id/verify

#### Users Authentication
- POST /api/v1/users/signup
- POST /api/v1/users/signin
- POST /api/v1/users/refresh
- POST /api/v1/users/logout
  
#### Routes
- `POST /api/v1/routes/estimate` → create route request (origin, destination, constraints)
- `POST /api/v1/routes/{route_req_id}/calculate` → calculate route result
- `GET /api/v1/routes/{route_req_id}` → get route details
- `GET /api/v1/routes` → get route history (with pagination)

#### Alerts
- `POST /api/v1/alerts/subscriptions` → create alert subscription
- `GET /api/v1/alerts/subscriptions` → get user subscriptions
- `GET /api/v1/alerts/alerts` → get user alerts
- `PATCH /api/v1/alerts/alerts/:id/read` → mark alert as read
- `PATCH /api/v1/alerts/subscriptions/:id` → deactivate alert subscription

#### Checkpoints
- `GET /api/v1/checkpoints` → get all checkpoints (with filtering, sorting, pagination)
- `GET /api/v1/checkpoints/{id}` → get checkpoint by ID
- `POST /api/v1/checkpoints` → create new checkpoint
- `PUT /api/v1/checkpoints/{id}` → update checkpoint details
- `PATCH /api/v1/checkpoints/{id}/status` → update checkpoint status (OPEN / CLOSED)

  
### API Design Rationale

* RESTful structure ensures simplicity and consistency
* Versioning (`/api/v1`) supports future updates
* Clear separation between resources
* Supports filtering, sorting, and pagination

---

## 🔐 Authentication & Security

The system uses **JWT Authentication**:

* Access Token
* Refresh Token

### Features

* Secure endpoints
* Role-based access (admin / moderator / user)
* Password hashing (bcrypt)
* Token expiration handling
* CORS enabled
* Input validation and error handling

---

## 🌍 External API Integration

The system integrates with:

* **OpenStreetMap API** → routing & geolocation
* **OpenWeather API** → weather data

### Handling Challenges

* API authentication
* Rate limiting
* Timeout handling
* Data transformation and integration

---

## 🧪 API Documentation & Testing

All APIs are documented and tested using **API-Dog**.

Includes:

* Endpoint definitions
* Request/response schemas
* Authentication setup
* Test cases

---

## ⚡ Performance Testing with k6

Performance testing was implemented using **k6**.

### Scenarios

* Read-heavy
* Write-heavy
* Mixed
* Spike
* Soak

### Summary Results

| Test Type   | Avg Response | p95      | Throughput  | Error |
| ----------- | ------------ | -------- | ----------- | ----- |
| Read-heavy  | 13.88 ms     | 26.43 ms | 35.81 req/s | 0%    |
| Write-heavy | 717.93 ms    | 1.97 s   | 13.91 req/s | 0%    |
| Mixed       | 374.57 ms    | 1.15 s   | 36.27 req/s | 0%    |
| Spike       | 15.77 ms     | 33.33 ms | 52.56 req/s | 0%    |
| Soak        | 17.26 ms     | 30.94 ms | 9.89 req/s  | 0%    |

### Key Insights

* Read operations are very fast
* Write operations slower due to DB
* System stable under load
* Zero failed requests

---

## 🐳 Deployment with Docker

The system is fully containerized using Docker.

### Run with Docker

```bash
docker compose up --build
```

### Services

* App → http://localhost:3000
* Database → MySQL inside Docker

### Notes

* DB connection uses retry mechanism
* Docker ensures consistent environment
* Easy deployment and scalability

---

## ⚙️ Installation & Running

### Option 1: Local

```bash
git clone https://github.com/sondosalqu/WaselPalestine-.git
cd WaselPalestine-
npm install
npm run dev
```

---

### Option 2: Docker

```bash
docker compose up --build
```

Test:

```
http://localhost:3000/test
```

---

## 🔁 Version Control Workflow

* Feature branches used
* Pull requests for merging
* Meaningful commit messages
* GitHub used for collaboration

---

## 👥 Team Members

* Sondos Alqotob
* Maiar Obeid
* Haya Khattabeh

---

## 📌 Project Notes

This project was developed as part of the Advanced Software Engineering course. It demonstrates backend system design including API architecture, database modeling, authentication, external integrations, performance optimization, and containerized deployment.
