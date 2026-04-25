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
## 🔹 Why Node.js + Express + MySQL?

The selected technology stack was chosen based on the following engineering considerations:

- **Scalability:** Node.js uses a non-blocking, event-driven architecture, making it suitable for handling multiple concurrent API requests efficiently.

- **Security:** JWT-based authentication (access and refresh tokens) ensures secure communication and controlled access to protected endpoints.

- **Maintainability:** Express.js provides a simple and modular structure, while Sequelize ORM helps organize database interactions cleanly, making the system easier to maintain and extend.

- **Development Efficiency:** The JavaScript ecosystem offers fast development, extensive libraries, and strong community support, reducing development time and complexity.

- **Database Reliability:** MySQL provides a robust relational database system with strong support for structured data, transactions, and data integrity.

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
### Checkpoints

* GET `/checkpoints` — List all checkpoints
* GET `/checkpoints/:id` — Get checkpoint details
* POST `/checkpoints` — Create checkpoint (Admin/Moderator)
* PUT `/checkpoints/:id` — Update checkpoint
* DELETE `/checkpoints/:id` — Delete checkpoint

### Checkpoint Status History

* GET `/checkpoints/:id/status-history` — Get checkpoint history
* POST `/checkpoints/:id/status-history` — Add status update

### Incidents

* GET `/incidents` — List incidents with filtering, sorting, pagination
* GET `/incidents/:id` — Get incident details
* POST `/incidents` — Create incident
* PATCH `/incidents/:id/verify`
* PATCH `/incidents/:id/close`

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
## 🔐 Authentication & Security

* JWT (Access + Refresh Tokens)
* Role-based access control
* Password hashing (bcrypt)
* Input validation & error handling
* CORS enabled


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
| Write-heavy | 717.93 ms | 1.97 s  | 20.95 req/s | 0% |
| Spike | 7.62 ms | 17.98 ms | 53 req/s | 0% |
| Soak | 5.69 ms | 13.81 ms | 9.96 req/s | 0% |

---

### Analysis

- Read-heavy, spike, and soak tests demonstrate excellent performance with very low latency and zero error rate.

- The system remains stable under mixed workload conditions, with acceptable response times considering the presence of write operations.

- Write-heavy workload shows significantly higher latency compared to read operations, confirming the expected performance gap between read and write paths.

- Overall, the system maintains reliability (0% error rate) across all scenarios, indicating stable behavior under concurrent load..

---

### Root Cause Analysis

- High latency in write-heavy scenarios is primarily caused by database insert operations.

- Each write request involves validation, persistence, and possibly additional processing (such as geolocation handling), which increases response time.

- Unlike read operations, write operations require synchronous interaction with the database, leading to slower performance under concurrent load.

---

### Bottlenecks

- Database write operations are more expensive than read operations
- Synchronous write processing adds latency
- Duplicate detection and validation add overhead
- Lack of caching for repeated read/external API data
---

### Improvements

- Add indexing on frequently used columns
- Optimize duplicate detection queries
- Introduce caching for read-heavy/external API data
- Consider asynchronous processing for write-heavy operations
---

### Before / After

After applying optimizations, the system shows significant improvement in read performance:

- Read average response time improved from ~13.88ms to ~7.41ms
- Read p95 latency improved from ~26.43ms to ~14.52ms

Mixed, spike, and soak scenarios also show noticeable latency improvements.

Write performance remains unchanged in this phase, as no specific optimizations were applied to the write path..
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

OPENWEATHER_API_KEY=your_openweather_api_key
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5

OSM_BASE_URL=https://router.project-osrm.org
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org

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
