# Phase-1
# 📘 Smart Library System – Monolithic Architecture

![Library System](https://img.shields.io/badge/Architecture-Monolithic-blue)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

## Overview
The Smart Library System (Monolithic Version) is a single, unified application that handles all core functionalities: managing users, books, and book loans. This system is ideal for simple deployments where all components are tightly coupled, sharing the same runtime and database.

## 🚀 Features

### 🧩 Functional Modules
1. **User Management Module**
   - Register users (students/faculty)
   - Update user profiles
   - Retrieve user information
   - Manage user roles and permissions

2. **Book Management Module**
   - Add/update/remove books
   - View book availability
   - Search books by title, author, or genre
   - Manage book categories and metadata

3. **Loan Management Module**
   - Issue books to users
   - Process book returns
   - View active/past loans
   - Manage due dates and late fees

## 🛢️ Database Schema
The system uses a unified relational database with the following core tables:

| Table  | Description                          |
|--------|--------------------------------------|
| users  | Stores user information              |
| books  | Stores book catalog details          |
| loans  | Tracks issued/returned books         |

Supported databases: PostgreSQL, MySQL, MongoDB etc

## 🔄 Architecture
- **Monolithic Design**: All components run in a single process
- **Internal Communication**: Module calls via function calls/internal classes
- **Tight Coupling**: Shared codebase and memory space
- **No network-based inter-module communication**

## 🧪 API Documentation

### REST Endpoints
The system exposes a comprehensive RESTful API following these principles:

- **RESTful Architecture**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON Payloads**: All requests/responses use JSON format
- **Consistent Naming**: `/api/{resource}` pattern
- **Stateless**: No client state stored on server
- **Proper Status Codes**: 2xx (success), 4xx (client errors), 5xx (server errors)
