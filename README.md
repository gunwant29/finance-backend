# Finance Data Processing and Access Control Backend

A RESTful backend for a finance dashboard system built with **Node.js**, **Express**, and **MongoDB**. Supports role-based access control, financial records management, and dashboard analytics.

---

## Tech Stack

| Layer        | Choice                          |
|--------------|---------------------------------|
| Runtime      | Node.js                         |
| Framework    | Express.js                      |
| Database     | MongoDB (via Mongoose)          |
| Auth         | JWT (jsonwebtoken + bcryptjs)   |
| Validation   | express-validator               |
| Logging      | morgan                          |

---

## Project Structure

```
src/
├── app.js                  # Express app setup, middleware, route mounting
├── server.js               # Entry point — connects DB and starts server
├── config/
│   ├── db.js               # MongoDB connection
│   └── roles.js            # Role definitions and permissions matrix
├── models/
│   ├── user.model.js       # User schema (name, email, password, role, isActive)
│   └── record.model.js     # Financial record schema (amount, type, category, date, notes)
├── middleware/
│   ├── auth.middleware.js  # JWT authentication + role/permission guards
│   ├── errorHandler.js     # Centralized error handling and 404 handling
│   └── validators.js       # Input validation rules using express-validator
├── services/
│   ├── auth.service.js     # Register and login logic
│   ├── user.service.js     # User CRUD and management
│   ├── record.service.js   # Financial record CRUD with filtering and pagination
│   └── dashboard.service.js# MongoDB aggregation pipelines for analytics
└── routes/
    ├── auth.routes.js      # /api/auth — register, login, me
    ├── user.routes.js      # /api/users — admin-only user management
    ├── record.routes.js    # /api/records — CRUD with role-based access
    └── dashboard.routes.js # /api/dashboard — summary and trend analytics
```

---

## Setup and Installation

### Prerequisites

- Node.js v18+
- MongoDB running locally or a MongoDB Atlas URI

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd finance-backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Start the server
npm run dev       # development (nodemon)
npm start         # production
```

### Environment Variables

| Variable        | Description                         | Default                              |
|-----------------|-------------------------------------|--------------------------------------|
| `PORT`          | Port to run the server on           | `3000`                               |
| `MONGODB_URI`   | MongoDB connection string           | `mongodb://localhost:27017/finance_db` |
| `JWT_SECRET`    | Secret key for signing JWTs         | *(must be set in production)*        |
| `JWT_EXPIRES_IN`| Token expiry duration               | `7d`                                 |

---

## Roles and Permissions

| Permission         | Viewer | Analyst | Admin |
|--------------------|:------:|:-------:|:-----:|
| Read records       | ✅     | ✅      | ✅    |
| Read dashboard     | ✅     | ✅      | ✅    |
| Read insights      | ❌     | ✅      | ✅    |
| Create records     | ❌     | ❌      | ✅    |
| Update records     | ❌     | ❌      | ✅    |
| Delete records     | ❌     | ❌      | ✅    |
| Manage users       | ❌     | ❌      | ✅    |

Access control is enforced via the `requirePermission(permission)` middleware, which checks against a central permissions matrix in `src/config/roles.js`.

---

## API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth — `/api/auth`

#### `POST /api/auth/register`
Register a new user.

**Body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "viewer"
}
```

**Response `201`:**
```json
{
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": { "id": "...", "name": "Alice", "email": "...", "role": "viewer" }
}
```

---

#### `POST /api/auth/login`
Login and receive a JWT.

**Body:**
```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

---

#### `GET /api/auth/me` 🔒
Returns the currently authenticated user.

---

### Users — `/api/users` 🔒 Admin only

| Method   | Endpoint                   | Description              |
|----------|----------------------------|--------------------------|
| `GET`    | `/api/users`               | List all users           |
| `GET`    | `/api/users/:id`           | Get a specific user      |
| `PATCH`  | `/api/users/:id/role`      | Change a user's role     |
| `PATCH`  | `/api/users/:id/status`    | Activate/deactivate user |
| `DELETE` | `/api/users/:id`           | Delete a user            |

**PATCH `/api/users/:id/role` body:**
```json
{ "role": "analyst" }
```

**PATCH `/api/users/:id/status` body:**
```json
{ "isActive": false }
```

---

### Financial Records — `/api/records` 🔒

| Method   | Endpoint            | Role Required | Description                     |
|----------|---------------------|---------------|---------------------------------|
| `GET`    | `/api/records`      | Any           | List records with filters       |
| `GET`    | `/api/records/:id`  | Any           | Get a specific record           |
| `POST`   | `/api/records`      | Admin         | Create a new record             |
| `PUT`    | `/api/records/:id`  | Admin         | Update a record                 |
| `DELETE` | `/api/records/:id`  | Admin         | Soft-delete a record            |

**GET `/api/records` — Query Parameters:**

| Param       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `type`      | string | Filter by `income` or `expense`          |
| `category`  | string | Filter by category name                  |
| `startDate` | date   | ISO 8601 date (e.g. `2024-01-01`)        |
| `endDate`   | date   | ISO 8601 date                            |
| `page`      | int    | Page number (default: 1)                 |
| `limit`     | int    | Records per page (default: 20, max: 100) |
| `sortBy`    | string | Field to sort by (default: `date`)       |
| `order`     | string | `asc` or `desc` (default: `desc`)        |

**POST `/api/records` body:**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2024-06-01",
  "notes": "June salary"
}
```

**Valid categories:** `salary`, `freelance`, `investment`, `rent`, `utilities`, `groceries`, `transport`, `healthcare`, `entertainment`, `education`, `other`

---

### Dashboard — `/api/dashboard` 🔒

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| `GET`  | `/api/dashboard/summary`          | Total income, expenses, net balance  |
| `GET`  | `/api/dashboard/categories`       | Totals grouped by category and type  |
| `GET`  | `/api/dashboard/trends/monthly`   | Monthly income/expense trends        |
| `GET`  | `/api/dashboard/trends/weekly`    | Weekly income/expense trends         |
| `GET`  | `/api/dashboard/recent`           | Most recent financial records        |

**GET `/api/dashboard/summary` response:**
```json
{
  "totalIncome": 25000,
  "totalExpenses": 12000,
  "netBalance": 13000
}
```

**GET `/api/dashboard/trends/monthly?months=6` response:**
```json
{
  "trends": [
    { "year": 2024, "month": 1, "type": "income", "total": 5000, "count": 2 },
    { "year": 2024, "month": 1, "type": "expense", "total": 2100, "count": 5 }
  ]
}
```

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "message": "Descriptive error message",
  "errors": ["field-level error 1", "field-level error 2"]
}
```

| Status | Meaning                                      |
|--------|----------------------------------------------|
| `400`  | Bad request / validation failure             |
| `401`  | Missing or invalid authentication token      |
| `403`  | Authenticated but insufficient permissions   |
| `404`  | Resource not found                           |
| `409`  | Conflict (e.g. duplicate email)              |
| `500`  | Internal server error                        |

---

## Design Decisions and Assumptions

### Soft Deletes
Financial records are never permanently deleted. Instead, an `isDeleted` flag is set to `true`. A Mongoose `pre-find` hook automatically excludes soft-deleted records from all queries, keeping the logic transparent.

### Permissions Matrix (not just role checks)
Rather than hardcoding role strings across route files, a central `PERMISSIONS` map in `src/config/roles.js` defines what each role can do. The `requirePermission(permission)` middleware checks this map. Adding a new role only requires updating one file.

### Password Security
Passwords are hashed with bcrypt (12 salt rounds) before saving. The password field is excluded from all Mongoose queries by default (`select: false`) and stripped before any JSON output.

### Pagination
All list endpoints support `page` and `limit` query parameters. Responses include a `pagination` object with `total`, `page`, `limit`, and `totalPages` for frontend convenience.

### Analytics via Aggregation
Dashboard endpoints use MongoDB aggregation pipelines rather than fetching all records into application memory. This keeps analytics efficient even at scale.

### Analyst Role — Read Insights
Analysts have `read:insights` permission (distinct from `read:records`) which can be used in future to gate more sensitive reports without changing existing access patterns.

---

## Optional Enhancements Included

- ✅ JWT-based authentication
- ✅ Pagination with metadata
- ✅ Soft delete for records
- ✅ Centralized error handler
- ✅ Request logging via morgan
- ✅ Input validation on all write endpoints

---

## Quick Test Flow

```bash
# 1. Register an admin
POST /api/auth/register
{ "name": "Admin", "email": "admin@test.com", "password": "pass123", "role": "admin" }

# 2. Login to get a token
POST /api/auth/login
{ "email": "admin@test.com", "password": "pass123" }

# 3. Create a financial record (use token from step 2)
POST /api/records
Authorization: Bearer <token>
{ "amount": 5000, "type": "income", "category": "salary", "date": "2024-06-01" }

# 4. View dashboard summary
GET /api/dashboard/summary
Authorization: Bearer <token>
```
---

## Links

- **GitHub Repository:** [https://github.com/gunwant29/finance-backend](https://github.com/gunwant29/finance-backend)
- **Live API (Render):** [https://finance-backend-mspv.onrender.com](https://finance-backend-mspv.onrender.com)

### Live API Endpoints to Try

| Description | URL |
|---|---|
| Health Check | https://finance-backend-mspv.onrender.com/api/health |
| Register | https://finance-backend-mspv.onrender.com/api/auth/register |
| Login | https://finance-backend-mspv.onrender.com/api/auth/login |
| Records | https://finance-backend-mspv.onrender.com/api/records |
| Dashboard Summary | https://finance-backend-mspv.onrender.com/api/dashboard/summary |

> **Note:** The API is hosted on Render's free tier. If it hasn't received traffic recently, the first request may take ~30 seconds to wake up. Subsequent requests will be fast.