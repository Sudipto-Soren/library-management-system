# 📚 Library Management System

A **production-ready RESTful backend** for managing a library, built with **Spring Boot**. This system handles user authentication, book cataloging, and book issue/return workflows with robust business logic, role-based access control, and comprehensive API documentation.

`Java 17` · `Spring Boot 3` · `PostgreSQL` · `JWT Authentication` · `Swagger/OpenAPI`

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Sample API Requests](#-sample-api-requests-curl)
- [Sample API Response](#-sample-api-response)
- [Testing Instructions](#-testing-instructions)
- [Business Rules](#-business-rules)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **JWT Authentication & Authorization** — Secure, stateless authentication using JSON Web Tokens
- **Role-Based Access Control** — Fine-grained access with `ADMIN` and `USER` roles
- **Book CRUD Operations** — Full create, read, update, and delete functionality for books
- **Search** — Search books by title, author, or ISBN keyword
- **Book Issue & Return** — Complete workflow with availability tracking and business rule enforcement
- **Pagination & Sorting** — Configurable pagination and multi-field sorting on list endpoints
- **Global Exception Handling** — Consistent, structured error responses across the entire API
- **Swagger/OpenAPI Documentation** — Interactive API docs auto-generated via springdoc-openapi
- **Input Validation** — Request-level validation with descriptive error messages

---

## 🛠 Tech Stack

| Technology            | Description                           |
|-----------------------|---------------------------------------|
| **Java 17**           | Programming language                  |
| **Spring Boot 3.2.5** | Application framework                 |
| **Spring Data JPA**   | ORM and data access layer             |
| **Spring Security**   | Authentication & authorization        |
| **PostgreSQL**        | Relational database                   |
| **JWT (jjwt)**        | JSON Web Token library                |
| **springdoc-openapi** | Swagger / OpenAPI documentation       |
| **Lombok**            | Boilerplate reduction                 |
| **Maven**             | Build & dependency management         |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17+** — [Download](https://adoptium.net/)
- **Maven 3.8+** — [Download](https://maven.apache.org/download.cgi)
- **PostgreSQL 14+** — [Download](https://www.postgresql.org/download/)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/library-management-system.git
cd library-management-system
```

### 2. Set Up PostgreSQL

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create the database
CREATE DATABASE library_db;

# Exit psql
\q
```

### 3. Configure the Application

Edit `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/library_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 4. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

### 5. Access the Application

| Resource        | URL                                          |
|-----------------|----------------------------------------------|
| **API Base**    | http://localhost:8080                         |
| **Swagger UI**  | http://localhost:8080/swagger-ui.html         |
| **API Docs**    | http://localhost:8080/api-docs                |

---

## 📁 Project Structure

```
src/main/java/com/librarymanagement/
├── config/
│   └── OpenApiConfig.java
├── controller/
│   ├── AuthController.java
│   ├── BookController.java
│   ├── IssueController.java
│   └── UserController.java
├── dto/
│   ├── ApiResponse.java
│   ├── AuthResponse.java
│   ├── BookRequest.java
│   ├── BookResponse.java
│   ├── IssueRequest.java
│   ├── IssueResponse.java
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── UserResponse.java
│   └── UserUpdateRequest.java
├── entity/
│   ├── Book.java
│   ├── IssueRecord.java
│   └── User.java
├── enums/
│   ├── IssueStatus.java
│   └── Role.java
├── exception/
│   ├── BadRequestException.java
│   ├── BookUnavailableException.java
│   ├── DuplicateResourceException.java
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
├── repository/
│   ├── BookRepository.java
│   ├── IssueRecordRepository.java
│   └── UserRepository.java
├── security/
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   └── SecurityConfig.java
├── service/
│   ├── AuthService.java
│   ├── BookService.java
│   ├── IssueService.java
│   └── UserService.java
├── util/
│   └── JwtUtil.java
└── LibraryManagementApplication.java
```

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint              | Description        | Access   |
|--------|-----------------------|--------------------|----------|
| POST   | `/api/auth/register`  | Register new user  | Public   |
| POST   | `/api/auth/login`     | Login user         | Public   |

### Books

| Method | Endpoint                        | Description    | Access        |
|--------|---------------------------------|----------------|---------------|
| POST   | `/api/books`                    | Add a book     | ADMIN         |
| GET    | `/api/books`                    | Get all books  | Authenticated |
| GET    | `/api/books/{id}`               | Get book by ID | Authenticated |
| GET    | `/api/books/search?keyword=`    | Search books   | Authenticated |
| PUT    | `/api/books/{id}`               | Update book    | ADMIN         |
| DELETE | `/api/books/{id}`               | Delete book    | ADMIN         |

### Users

| Method | Endpoint          | Description      | Access        |
|--------|-------------------|------------------|---------------|
| GET    | `/api/users/me`   | Get current user | Authenticated |
| GET    | `/api/users`      | Get all users    | Authenticated |
| GET    | `/api/users/{id}` | Get user by ID   | Authenticated |
| PUT    | `/api/users/me`   | Update profile   | Authenticated |

### Book Issues

| Method | Endpoint                  | Description      | Access        |
|--------|---------------------------|------------------|---------------|
| POST   | `/api/issues/issue`       | Issue a book     | Authenticated |
| POST   | `/api/issues/return/{id}` | Return a book    | Authenticated |
| GET    | `/api/issues/my-issues`   | My issued books  | Authenticated |
| GET    | `/api/issues`             | All issues       | ADMIN         |

---

## 📬 Sample API Requests (cURL)

### 1. Register a New User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Add a Book (ADMIN)

```bash
curl -X POST http://localhost:8080/api/books \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-jwt-token>' \
  -d '{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "978-0132350884",
    "category": "Programming",
    "quantity": 5
  }'
```

### 4. Get All Books (with Pagination)

```bash
curl -X GET 'http://localhost:8080/api/books?page=0&size=10&sortBy=title&sortDir=asc' \
  -H 'Authorization: Bearer <your-jwt-token>'
```

### 5. Search Books

```bash
curl -X GET 'http://localhost:8080/api/books/search?keyword=clean&page=0&size=10' \
  -H 'Authorization: Bearer <your-jwt-token>'
```

### 6. Issue a Book

```bash
curl -X POST http://localhost:8080/api/issues/issue \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-jwt-token>' \
  -d '{"bookId": 1}'
```

### 7. Return a Book

```bash
curl -X POST http://localhost:8080/api/issues/return/1 \
  -H 'Authorization: Bearer <your-jwt-token>'
```

### 8. Get My Issues

```bash
curl -X GET 'http://localhost:8080/api/issues/my-issues?page=0&size=10' \
  -H 'Authorization: Bearer <your-jwt-token>'
```

---

## 📦 Sample API Response

A successful response follows this consistent structure:

```json
{
  "success": true,
  "message": "Book added successfully",
  "data": {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "978-0132350884",
    "category": "Programming",
    "quantity": 5,
    "availableQuantity": 5,
    "createdAt": "2026-05-28T10:30:00"
  },
  "timestamp": "2026-05-28T10:30:00"
}
```

---

## 🧪 Testing Instructions

1. **Start PostgreSQL** and create the `library_db` database (see [Getting Started](#2-set-up-postgresql))
2. **Run the application** with `mvn spring-boot:run`
3. **Open Swagger UI** at [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
4. **Register a user** via `POST /api/auth/register`
5. **Login** to obtain a JWT token via `POST /api/auth/login`
6. **Authorize in Swagger UI** — Click the **Authorize** button and enter: `Bearer <your-token>`
7. **Test all endpoints** through the interactive Swagger UI

### Creating an ADMIN User

Register a regular user, then manually update the role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## 📌 Business Rules

| Rule | Description |
|------|-------------|
| **Issue** | Available quantity **decreases** when a book is issued |
| **Return** | Available quantity **increases** when a book is returned |
| **Availability Check** | Cannot issue a book with **0** available quantity |
| **Duplicate Issue** | Same user **cannot** issue the same book twice (must return first) |
| **Due Date** | Book due date is **14 days** from issue date |
| **Unique ISBN** | ISBN must be **unique** across all books |
| **Unique Email** | Email must be **unique** across all users |
| **Password Security** | Passwords are encrypted with **BCrypt** |

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ using Spring Boot
</p>
