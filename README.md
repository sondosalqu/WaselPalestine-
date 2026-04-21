# 🚗 Wasel Palestine - Smart Mobility API

## 📌 Overview

Wasel Palestine is a backend RESTful API designed to support smart mobility in Palestine.
It provides real-time and structured data about checkpoints, incidents, reports, and route estimation.

The API can be used by mobile apps, web dashboards, or third-party systems.

---

## ⚙️ Tech Stack

* Node.js
* Express.js
* MySQL
* Sequelize ORM
* JWT Authentication
* Docker & Docker Compose

---

## 🚀 Getting Started

### 🔹 Run Locally

```bash
git clone https://github.com/sondosalqu/WaselPalestine-.git
cd WaselPalestine-
npm install
npm run dev
```

---

### 🔹 Run with Docker

```bash
docker compose up --build
```

App will run on:

```
http://localhost:3000
```

---

## 🔐 Authentication

The system uses JWT authentication:

* Access Token
* Refresh Token

Supports role-based access:

* Admin
* Moderator
* User

---

## 🔗 API Base URL

```
/api/v1/
```

Example:

```
GET /api/v1/reports
```

---

## 📚 Documentation

Full project documentation (Architecture, Database, API, Testing, etc.) is available in the Wiki:

👉 https://github.com/sondosalqu/WaselPalestine-/wiki

---

## 🐳 Deployment

The project is fully containerized using Docker for easy deployment and scalability.

---

## 👥 Team Members

* Sondos Alqotob
* Maiar Obeid
* Haya Khattabeh

---

## 📌 Notes

This project was developed as part of an Advanced Software Engineering course.
It demonstrates backend architecture, API design, database modeling, authentication, and performance optimization.

---
