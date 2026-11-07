# SkillConnect Backend API Documentation

The **SkillConnect Backend API** is built using Django 5, Django REST Framework, SimpleJWT Authentication, SQLite database, and CORS headers.

Base URL: `http://127.0.0.1:8000/api/`

---

## Table of Contents
1. [Authentication APIs](#1-authentication-apis)
2. [Category APIs](#2-category-apis)
3. [Worker APIs & Search](#3-worker-apis--search)
4. [Customer APIs](#4-customer-apis)
5. [Booking Workflow APIs](#5-booking-workflow-apis)
6. [Review APIs](#6-review-apis)
7. [Dashboard & Analytics APIs](#7-dashboard--analytics-apis)
8. [Demo Credentials](#8-demo-credentials)

---

## 1. Authentication APIs

### 1.1 Customer Registration
- **Method**: `POST`
- **URL**: `/api/auth/register/customer/`
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "full_name": "Kiran Patel",
    "email": "kiran.patel@example.com",
    "phone": "+91 98989 12345",
    "password": "password123",
    "address": "Flat 402, Oakwood Heights",
    "ward": "Ward 12",
    "panchayat": "Gandhi Nagar",
    "district": "Central Metro",
    "state": "Karnataka",
    "pincode": "560001"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "message": "Customer registered successfully.",
    "tokens": {
      "refresh": "<refresh_jwt_token>",
      "access": "<access_jwt_token>"
    },
    "user": { ... }
  }
  ```

### 1.2 Worker Registration
- **Method**: `POST`
- **URL**: `/api/auth/register/worker/`
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "full_name": "Rajesh Kumar",
    "email": "rajesh.electrician@skillconnect.org",
    "phone": "+91 98765 43210",
    "password": "password123",
    "category_id": "electrician",
    "experience": "8 Years",
    "hourly_rate": 35.00,
    "district": "Central Metro"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "message": "Worker registered successfully. Pending admin verification.",
    "tokens": { ... },
    "user": { ... }
  }
  ```

### 1.3 Login (Obtain JWT Pair)
- **Method**: `POST`
- **URL**: `/api/auth/login/`
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "email": "kiran.patel@example.com",
    "password": "password123",
    "role": "customer"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Login successful.",
    "tokens": {
      "access": "<access_token>",
      "refresh": "<refresh_token>"
    },
    "user": {
      "id": 2,
      "name": "Kiran Patel",
      "role": "customer"
    }
  }
  ```

### 1.4 Refresh Token
- **Method**: `POST`
- **URL**: `/api/auth/token/refresh/`
- **Authentication**: Public
- **Request Body**: `{ "refresh": "<refresh_token>" }`

### 1.5 Get / Update Profile
- **Method**: `GET` / `PUT`
- **URL**: `/api/auth/profile/`
- **Authentication**: Required (`Bearer <access_token>`)

---

## 2. Category APIs

### 2.1 List Categories
- **Method**: `GET`
- **URL**: `/api/categories/`
- **Authentication**: Public

### 2.2 Create Category (Admin Only)
- **Method**: `POST`
- **URL**: `/api/categories/`
- **Authentication**: Admin Required (`Bearer <admin_token>`)

---

## 3. Worker APIs & Search

### 3.1 Search Verified Workers
- **Method**: `GET`
- **URL**: `/api/workers/?category=electrician&district=Central%20Metro&min_rating=4.5&availability=true&search=wiring`
- **Authentication**: Public
- **Filters Supported**:
  - `category`: Category slug (e.g. `electrician`, `plumber`)
  - `district`: District filter
  - `availability`: `true` or `false`
  - `min_rating`: Minimum rating filter (e.g. `4.5`)
  - `search`: Keyword search in name, skills, category

### 3.2 Get Worker Profile Detail
- **Method**: `GET`
- **URL**: `/api/workers/<id>/`
- **Authentication**: Public

### 3.3 Worker Toggle Availability
- **Method**: `POST`
- **URL**: `/api/workers/toggle_availability/`
- **Authentication**: Worker Required (`Bearer <worker_token>`)

### 3.4 Admin Worker Verification (Approve / Reject)
- **Method**: `POST`
- **URL**: `/api/workers/<id>/verify/` & `/api/workers/<id>/reject/`
- **Authentication**: Admin Required (`Bearer <admin_token>`)

---

## 4. Customer APIs & 5. Booking Workflow APIs

### 5.1 Create Service Booking
- **Method**: `POST`
- **URL**: `/api/bookings/`
- **Authentication**: Customer Required (`Bearer <customer_token>`)
- **Request Body**:
  ```json
  {
    "worker": 1,
    "service_date": "2026-09-20",
    "service_time": "10:00 AM - 12:00 PM",
    "address": "Flat 402, Oakwood Heights",
    "notes": "Smart switch installation"
  }
  ```

### 5.2 List Customer Bookings
- **Method**: `GET`
- **URL**: `/api/bookings/my_bookings/`
- **Authentication**: Customer Required

### 5.3 List Worker Jobs
- **Method**: `GET`
- **URL**: `/api/bookings/my_jobs/`
- **Authentication**: Worker Required

### 5.4 Accept / Reject Booking (Worker)
- **Method**: `POST`
- **URL**: `/api/bookings/<id>/accept/` or `/api/bookings/<id>/reject/`

### 5.5 Submit Estimate (Worker)
- **Method**: `POST`
- **URL**: `/api/bookings/<id>/submit_estimate/`
- **Request Body**:
  ```json
  {
    "estimate_amount": 85.00,
    "estimate_breakdown": [
      {"item": "Labor Charge", "cost": 60.0},
      {"item": "Parts Unit", "cost": 25.0}
    ]
  }
  ```

### 5.6 Approve Estimate (Customer)
- **Method**: `POST`
- **URL**: `/api/bookings/<id>/approve_estimate/`

### 5.7 Mark Completed (Worker)
- **Method**: `POST`
- **URL**: `/api/bookings/<id>/complete/`

---

## 6. Review APIs

### 6.1 Submit Customer Review
- **Method**: `POST`
- **URL**: `/api/reviews/`
- **Authentication**: Customer Required
- **Request Body**:
  ```json
  {
    "booking": 1,
    "rating": 5.0,
    "comment": "Outstanding work! Punctual and polite."
  }
  ```

### 6.2 Get Worker Reviews
- **Method**: `GET`
- **URL**: `/api/reviews/worker/<worker_id>/`

---

## 7. Dashboard & Analytics APIs

- **Customer Dashboard**: `GET /api/dashboard/customer/`
- **Worker Dashboard**: `GET /api/dashboard/worker/`
- **Admin Dashboard**: `GET /api/dashboard/admin/`

---

## 8. Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@skillconnect.org` | `admin123` |
| **Customer** | `kiran.patel@example.com` | `password123` |
| **Worker (Electrician)** | `rajesh.electrician@skillconnect.org` | `password123` |
| **Worker (Cleaner)** | `sunita.cleaning@skillconnect.org` | `password123` |
| **Worker (Plumber)** | `michael.plumbing@skillconnect.org` | `password123` |
