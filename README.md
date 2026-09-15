# Job Portal Application

A full-stack MERN job portal that connects candidates with employers — job browsing and applications, an admin console for recruiters, and a built-in interview-preparation question bank organised by company and by role.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Backend Setup](#backend-setup)
  - [Candidate Frontend Setup](#candidate-frontend-setup)
  - [Admin Panel Setup](#admin-panel-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Making Your First Admin Account](#making-your-first-admin-account)
- [Roadmap](#roadmap)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Job Portal Application is a three-part system built on the MERN stack:

| App | Description |
|---|---|
| **`jpa_frontend`** | The public, candidate-facing site — browse and apply to jobs, prepare with interview questions, save items, manage your profile. |
| **`admin`** | The recruiter/admin console — manage job postings, companies, applicants, and interview-question content. |
| **`jpa_backend`** | The shared REST API — authentication, business logic, database access, file uploads, and email delivery for both frontends. |

## Features

**Candidates**
- Browse, search, and filter job listings by role, category, location, and experience
- Apply to jobs and track application history
- Interview-question bank organised **by company** and **by role**
- Save/bookmark jobs and interview questions for later
- Secure sign-up with email OTP verification, login, and password reset
- Profile management with résumé upload

**Admins**
- Create, edit, close, and delete job postings
- Manage partner companies
- View applicants per job, including résumé access
- Add and manage interview-question sets (with bulk CSV import) by company or by role
- Dashboard with live stats — total jobs, closed jobs, total applicants, active companies

**Platform**
- JWT-based authentication with role-based access control (user / admin)
- Cloud-hosted media (Cloudinary) for logos, images, résumés, and CSV imports
- Transactional email (Brevo) for OTP verification and password resets
- Public inquiry/contact form

## Tech Stack

- **Frontend (candidate + admin):** React 19, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express 5
- **Database:** MongoDB Atlas, Mongoose
- **Auth:** JSON Web Tokens (JWT), bcryptjs
- **File Storage:** Cloudinary (via Multer)
- **Email:** Brevo (Sendinblue) API

## Project Structure

```
Job-Portal-Application/
├── jpa_frontend/     # Candidate-facing React app
├── admin/            # Admin console React app
└── jpa_backend/      # Express REST API
    ├── config/        # DB and Cloudinary configuration
    ├── controller/    # Route handlers / business logic
    ├── middleware/     # Auth, authorization, file upload
    ├── models/         # Mongoose schemas
    ├── routes/         # Express route definitions
    └── utils/          # Email service, helpers
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB)
- A [Cloudinary](https://cloudinary.com/) account (for image/file uploads)
- A [Brevo](https://www.brevo.com/) account (for sending OTP emails)

### Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### Backend Setup

```bash
cd jpa_backend
npm install
```

Create a `.env` file in `jpa_backend/` (see [Environment Variables](#environment-variables) below), then start the server:

```bash
npm start
```

The API runs on **http://localhost:5000** by default.

### Candidate Frontend Setup

```bash
cd jpa_frontend
npm install
npm run dev
```

Runs on **http://localhost:5173** by default.

### Admin Panel Setup

```bash
cd admin
npm install
npm run dev
```

Also defaults to port `5173` — if the candidate frontend is already running, Vite will automatically start this on **`5174`** instead. Both ports are already whitelisted in the backend's CORS configuration.

> **Tip:** Run all three (`jpa_backend`, `jpa_frontend`, `admin`) at the same time, each in its own terminal tab, for the full app to work end to end.

## Environment Variables

Create `jpa_backend/.env` with the following keys:

```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=a_long_random_secret_string

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_api_secret

# Email (Brevo)
EMAIL_USER=your_sender_email@example.com
BREVO_API_KEY=your_brevo_api_key
```

> **Never commit your `.env` file.** Make sure `jpa_backend/.gitignore` includes `.env` and `node_modules/` before pushing (see [Security Notes](#security-notes)).

## API Overview

All endpoints are prefixed with `/api`. A few highlights:

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new account (sends OTP) |
| `POST` | `/api/auth/login` | Public | Log in and receive a JWT |
| `GET` | `/api/job` | Public | List active jobs |
| `POST` | `/api/job` | Admin | Create a job posting |
| `POST` | `/api/application/apply/:id` | User | Apply to a job |
| `GET` | `/api/interview/roles` | Public | List interview-prep roles |
| `GET` | `/api/interview/companies` | Public | List interview-prep companies |
| `GET` | `/api/saved` | User | Get saved jobs & questions |

Full endpoint reference is in the project report (`/docs` or your submitted report, if included in this repo).

## Making Your First Admin Account

There's no self-service way to register as an admin (by design — it's a security boundary, not an oversight). To create one:

1. Register a normal account through the candidate frontend and verify it via the OTP.
2. Open your MongoDB Atlas cluster → **Browse Collections** → the `users` collection.
3. Find your account by email and change its `role` field from `"user"` to `"admin"`.
4. Log in at the admin panel with the same credentials.

## Roadmap

- [ ] Automated résumé parsing / keyword matching
- [ ] Real-time application-status notifications
- [ ] Refresh-token rotation
- [ ] Rate limiting on auth and public endpoints
- [ ] Admin analytics charts
- [ ] Automated test suite (Jest / Supertest)
- [ ] Docker + CI/CD pipeline

## Security Notes

- Passwords are hashed with bcrypt; plaintext passwords are never stored.
- Sessions are stateless JWTs, verified on every protected request.
- All admin-only routes explicitly check the caller's role.
- Keep `MONGO_URI`, `JWT_SECRET`, and all API keys out of version control — use `.env` and make sure it's listed in `.gitignore`.
- If any of these secrets were ever committed to this repository's history, rotate them (Mongo Atlas password, JWT secret, Cloudinary secret, Brevo API key) even after removing them from the latest commit.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE) — feel free to use it as a learning reference or a starting point for your own project. Add a `LICENSE` file to the repo root if one isn't already present.

---

<p align="center">Built with ❤️ using the MERN stack.</p>
