# 📚 Distributed Systems Lab — Step-by-Step Guide

Welcome to the Distributed Systems Lab! This project walks you through building a scalable library management system from a monolithic architecture to fully containerized microservices.

---

## 🚀 Phase 1: Monolithic Smart Library System

### 🔧 Overview
Start by building a monolithic backend that manages users, book catalog, and borrowing records in a single codebase.

### 📘 You Will Learn
- How to structure a monolithic application
- Separation of concerns using Controller → Service → Repository pattern
- Core module development:
  - User Management
  - Catalog Service
  - Borrowing System
- Limitations of monoliths: tight coupling, scaling challenges

---

## 🧩 Phase 2: Transition to Microservices

### 🔧 Overview
Break the monolith into independent microservices for modularity and scalability.

### 📘 You Will Learn
- Service decomposition by business capabilities
- Designing REST APIs for inter-service communication
- Managing separate databases per service
- Understanding loose coupling and bounded contexts

---

## 🌐 Phase 3: Reverse Proxy with Nginx

### 🔧 Overview
Use Nginx to route traffic and manage service access via a reverse proxy.

### 📘 You Will Learn
- Fundamentals of reverse proxies
- Writing Nginx configs for service routing and load balancing
- Enabling HTTPS and serving static files
- Centralized access logging and control

---

## 🐳 Phase 4: Containerization with Docker

### 🔧 Overview
Package each service into Docker containers for environment consistency.

### 📘 You Will Learn
- Writing Dockerfiles for Node.js / Python / Java microservices
- Managing images and containers
- Creating isolated, reproducible development environments

---

## ⚙️ Phase 5: Managing with Docker Compose

### 🔧 Overview
Coordinate multiple containers using Docker Compose.

### 📘 You Will Learn
- Writing `docker-compose.yml` for multi-service environments
- Networking and linking services (e.g. User ↔ Catalog ↔ Borrowing)
- Streamlining local development and testing workflows

---

## 🚢 Phase 6: Orchestration with Docker Swarm (Optional)

### 🔧 Overview
Use Docker Swarm for distributed orchestration in a production-like cluster.

### 📘 You Will Learn
- Initializing a Docker Swarm cluster
- Deploying services with replicas across nodes
- Ensuring high availability and self-healing via Swarm features

---

## 🧪 Prerequisites
- Git, Docker, Docker Compose
- Node.js or Python (depending on service language)
- Basic understanding of REST APIs and HTTP

---

