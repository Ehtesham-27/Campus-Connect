# Campus Connect

> **Your campus. Your people. Your opportunities.**

Campus Connect is a college-focused student community platform designed to bring students, societies, campus information, and opportunities together in one place.

---

## 1. Product Scope & Core Modules

The platform is focused around seven core modules:

1. **Discover**: Find students with similar interests through profile search and filters (interests, skills, course, year).
2. **Communities**: Browse and join college societies, clubs, and interest groups.
3. **Campus Feed**: Centralize scattered college information, campus announcements, society updates, and event posts.
4. **Opportunities**: Discover internships, events, workshops, competitions, and scholarships.
5. **Team Finder**: Find hackathon and project teammates with specific skill requirements.
6. **Study Circles**: Find classmates and study partners through subject-based groups and peer learning.
7. **Connections**: Build student networks through connection requests and accepted connections.

### User Roles
- **Student**: Access to the seven core modules, profile management, and content creation.
- **Admin**: Dedicated protected dashboard for platform moderation, society management, opportunity verification, and content reports. (Admins cannot register publicly).

---

## 2. Technology Stack

- **Frontend**: React (v19), Vite (v8), TypeScript, React Router (v7), Axios, Lucide React
- **Backend**: Node.js, Express.js (v4), JavaScript ES Modules, REST API architecture
- **Database**: MongoDB with Mongoose (v8)
- **Authentication**: JWT & bcrypt (session/cookie foundation)
- **Image Storage**: Cloudinary (handled securely via backend)
- **Architecture**: Modular Monolith

---

## 3. Monorepo Repository Structure

```text
campus-connect/
│
├── frontend/                     # React + Vite + TypeScript application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── app/                  # Application routing & providers
│   │   ├── assets/               # Images and static media
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ui/               # Primitives (buttons, inputs, cards)
│   │   │   ├── layout/           # App shells (StudentLayout, AdminLayout)
│   │   │   ├── forms/            # Form controls
│   │   │   └── feedback/         # Loading, alerts, empty states
│   │   ├── features/             # Feature module pages and state
│   │   │   ├── auth/             # Login, Register, Forgot Password
│   │   │   ├── discover/         # Discover students
│   │   │   ├── communities/      # Societies & clubs
│   │   │   ├── feed/             # Campus announcements & posts
│   │   │   ├── opportunities/    # Internships, events, competitions
│   │   │   ├── team-finder/      # Team posts & applications
│   │   │   ├── study-circles/    # Study circles & peer groups
│   │   │   ├── connections/      # Connection requests & list
│   │   │   ├── profile/          # Student profile & settings
│   │   │   └── admin/            # Admin moderation & overview
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Shared utilities & API client
│   │   │   ├── api/              # Axios client instance
│   │   │   ├── validation/       # Input schemas & validation
│   │   │   └── utils/            # Helper functions
│   │   ├── types/                # TypeScript interfaces and types
│   │   ├── styles/               # Global CSS & reset
│   │   ├── App.tsx               # Main application component
│   │   └── main.tsx              # Frontend DOM entry point
│   ├── .env.example              # Frontend environment variables template
│   ├── tsconfig.json             # TypeScript configuration
│   └── package.json              # Frontend dependencies and scripts
│
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/               # Environment & database configuration
│   │   ├── models/               # Mongoose schema definitions
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── services/             # Business logic layer
│   │   ├── routes/               # Express modular route definitions
│   │   ├── middleware/           # Auth, error, and not-found handlers
│   │   ├── validators/           # Request validation schemas
│   │   ├── utils/                # Standard ApiError, ApiResponse, asyncHandler
│   │   ├── constants/            # Roles, statuses, and codes
│   │   ├── app.js                # Express app configuration & middleware
│   │   └── server.js             # Server startup & graceful shutdown
│   ├── .env.example              # Backend environment variables template
│   └── package.json              # Backend dependencies and scripts
│
├── docs/                         # Architecture documentation
│   ├── idea.md                   # Product vision, user roles, and scope
│   └── frontend.md               # Frontend specification and UI requirements
│
├── .gitignore                    # Git ignore file (excludes secrets & dependencies)
├── package.json                  # Root monorepo orchestrator
└── README.md                     # Project documentation & run guide
```

---

## 4. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested and supported)
- **npm**: v9.0.0 or higher (v11.x tested and supported)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI (optional for initial structure verification)

### Installation

Install all dependencies across the monorepo using the root command:

```bash
npm run install:all
```

Or install individually:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Environment Configuration

1. Copy backend environment template:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Copy frontend environment template:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

---

## 5. Running the Application

### Option A: Run Both Frontend and Backend Concurrently (Recommended)

From the project root:

```bash
npm run dev
```

### Option B: Run Services Individually

1. **Start the Backend API Server:**
   ```bash
   npm run dev:backend
   # Or inside backend/: npm run dev
   ```
   - Running at: `http://localhost:5000`
   - Health check: `http://localhost:5000/api/v1/health`

2. **Start the Frontend Development Server:**
   ```bash
   npm run dev:frontend
   # Or inside frontend/: npm run dev
   ```
   - Running at: `http://localhost:5173`

---

## 6. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs backend and frontend development servers concurrently |
| `npm run dev:backend` | Starts backend development server with nodemon |
| `npm run dev:frontend` | Starts frontend development server with Vite |
| `npm run build:frontend` | Runs TypeScript checks and builds frontend bundle |
| `npm run start:backend` | Starts backend production server |
| `npm run install:all` | Installs dependencies for both backend and frontend |

---

## 7. Verification & Health Check

### Backend Health Check
Verify the backend is running by requesting the health check endpoint:

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Campus Connect API is operating normally",
  "data": {
    "service": "Campus Connect API",
    "status": "healthy",
    "environment": "development",
    "uptimeSeconds": 12,
    "timestamp": "2026-11-04T18:20:47.329Z",
    "database": {
      "state": "connected"
    }
  }
}
```

### Frontend Build Check
Run the TypeScript compiler and Vite production build check:

```bash
npm run build:frontend
```

---

## 8. Current Implementation Status

This repository is currently initialized with the **clean project foundation**:
- Modular monolith backend skeleton with central error handling, health check, Mongoose configuration, and placeholder route structure.
- React + Vite + TypeScript frontend with modular feature structure, React Router setup, centralized Axios client, and placeholder route views for all student and admin modules.
- Full feature implementations (authentication, database schemas, and seven core modules) will proceed in scheduled phases according to `idea.md` and `frontend.md`.

