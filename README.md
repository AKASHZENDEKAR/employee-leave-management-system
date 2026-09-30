# Employee Leave Management System

A full-stack Employee Leave Management System built with React.js, Django REST Framework, and PostgreSQL.

The system allows employees to apply for leave, track their leave requests, and cancel pending requests. Managers can review leave requests, approve or reject them, filter and search requests, and view employee leave statistics.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Leave Workflow](#leave-workflow)
- [Leave Rules](#leave-rules)
- [Employee Dashboard](#employee-dashboard)
- [Manager Dashboard](#manager-dashboard)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Filtering and Search](#filtering-and-search)
- [Database](#database)
- [Environment Configuration](#environment-configuration)
- [Local Development Setup](#local-development-setup)
- [Docker Setup](#docker-setup)
- [Swagger API Documentation](#swagger-api-documentation)
- [Testing](#testing)
- [Frontend Build](#frontend-build)
- [Screenshots](#screenshots)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Project Status](#project-status)
- [Author](#author)

---

# Project Overview

The Employee Leave Management System is a role-based web application designed to simplify employee leave management.

Employees can:

- Sign in securely
- View their dashboard
- Apply for leave
- View leave history
- Cancel pending leave requests

Managers can:

- View all leave requests
- Approve or reject leave requests
- Filter leave requests by status
- Search leave requests
- View employee leave statistics
- Monitor leave activity through the manager dashboard

The project uses JWT authentication, Django REST Framework APIs, PostgreSQL, React Router, Axios interceptors, validation, pagination, search, and role-based permissions.

---

# Features

## Authentication

- JWT authentication
- Login API
- Registration API
- Refresh token API
- Current-user API
- Protected frontend routes
- Role-based access
- Employee and manager roles

## Employee Features

- Employee login
- Employee dashboard
- Apply for leave
- View leave history
- Cancel pending leave
- View approved leave
- View pending leave
- View remaining leave
- Form validation
- Loading states
- Error handling
- Responsive interface

## Manager Features

- Manager login
- Manager dashboard
- View all leave requests
- Approve leave requests
- Reject leave requests
- Add manager comments
- Filter by leave status
- Search leave requests
- Pagination
- Employee leave statistics

## Backend Features

- Django REST Framework ViewSets
- JWT authentication
- Serializer validation
- Custom permissions
- PostgreSQL
- Proper relational models
- Pagination
- Search API
- Filtering API
- Transaction-based approval/rejection/cancellation
- Approved-leave overlap checking

## Additional Features

- Swagger API documentation
- Unit tests
- Docker
- Docker Compose
- PostgreSQL schema export
- Environment configuration template

---

# Technology Stack

## Frontend

- React.js
- React Router
- Axios
- JavaScript
- HTML5
- CSS3
- Vite

## Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- django-filter
- drf-spectacular
- django-cors-headers

## Database

- PostgreSQL

## DevOps / Tools

- Docker
- Docker Compose
- Git
- GitHub
- Swagger / OpenAPI
- PowerShell

---

# System Architecture

```text
                    +----------------------+
                    |      React.js        |
                    |      Frontend        |
                    |   React Router       |
                    |       Axios          |
                    +----------+-----------+
                               |
                               | HTTP / REST API
                               |
                               v
                    +----------------------+
                    |      Django REST     |
                    |       Backend        |
                    |                       |
                    | JWT Authentication   |
                    | ViewSets              |
                    | Serializers           |
                    | Permissions           |
                    | Business Rules        |
                    +----------+-----------+
                               |
                               | PostgreSQL
                               |
                               v
                    +----------------------+
                    |      PostgreSQL      |
                    |       Database       |
                    +----------------------+

leave-management-system/
│
├── .gitignore
├── README.md
├── docker-compose.yml
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── manage.py
│   ├── requirements.txt
│   │
│   ├── apps/
│   │   ├── accounts/
│   │   ├── leaves/
│   │   └── dashboard/
│   │
│   └── config/
│
├── frontend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── App.jsx
│
├── database/
│   └── schema.sql
│
└── docs/
    └── screenshots/

