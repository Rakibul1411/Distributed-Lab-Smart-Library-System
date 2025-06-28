# 🧩 Smart Library System – Microservices Architecture

## 📖 Overview
In the microservices version of the Smart Library System, the application is divided into three independently deployable services:

- **User Service**
- **Book Service**
- **Loan Service**

Each service has its own database and communicates with others via HTTP-based RESTful APIs.

---

## 🧱 Services Overview

### 1. 👤 User Service
- Handles user registration, profile management, and lookups.
- 📦 Owns a dedicated user database.
- 🚪 **Base Path**: `/api/users`

### 2. 📚 Book Service
- Manages the book catalog, inventory, and availability.
- 📦 Owns a dedicated book database.
- 🚪 **Base Path**: `/api/books`

### 3. 🔄 Loan Service
- Issues and returns books.
- Interacts with both the User and Book Services.
- 📦 Owns a dedicated loan database.
- 🚪 **Base Path**: `/api/loans`

---

## 🛢️ Databases (One per Service)

| Service       | Database   | Tables  |
|---------------|------------|---------|
| User Service  | user_db    | users   |
| Book Service  | book_db    | books   |
| Loan Service  | loan_db    | loans   |

Each service is fully decoupled with its own schema and persistence layer.

---

## 🔗 Inter-Service Communication

### 🔄 Communication Pattern
- **Synchronous REST calls** between services
- **No message queues / Kafka** used in this version

### 💬 Loan Service Dependencies
When creating a loan, the Loan Service makes the following HTTP requests:

1. `GET /api/users/{id}` → validate user exists
2. `GET /api/books/{id}` → check book availability
3. `PATCH /api/books/{id}/availability` → update availability
4. `INSERT` loan into its own database

### 🌐 Example URLs (during development)
- User Service: `http://user-service:8081`
- Book Service: `http://book-service:8082`
- Loan Service: `http://loan-service:8083`

---

## ⚙️ Implementation Details

- **HTTP Clients**: Each service uses an internal HTTP client (e.g., axios, fetch) to call other services.
- **Circuit Breakers**: Optional layer to prevent failure propagation.
- **Timeouts**: Set timeouts for all inter-service calls to avoid hanging requests.

---

## 🚦 Loan Creation Flow (Step-by-Step)

```
Client → POST /api/loans → Loan Service
      → GET /api/users/{user_id}        (User Service)
      → GET /api/books/{book_id}        (Book Service)
      → PATCH /api/books/{book_id}/availability  (Book Service)
      → INSERT loan into loan_db
      → Response to Client
```

---

## ❗ Error Handling

| Scenario                         | Response Code | Description                     |
|----------------------------------|----------------|---------------------------------|
| User Service unavailable         | 503            | Service Unavailable              |
| Book Service unavailable         | 503            | Service Unavailable              |
| User does not exist              | 404            | Not Found                        |
| Book does not exist or is empty | 400            | Bad Request                      |

---

## 🧪 API Design & Documentation

### 🌍 Principles
- **RESTful Architecture**: Each resource has a clear endpoint
- **JSON Payloads**: All data exchanged in JSON format
- **Stateless Communication**: No session state between requests
- **Service Isolation**: Each service has its own route prefix and database
- **Proper HTTP Codes**: 2xx (success), 4xx (client error), 5xx (server error)

### 📑 Suggested Tools
- Swagger/OpenAPI for API documentation
- Postman collections for manual testing
