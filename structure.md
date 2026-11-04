# Campus Connect — Project Structure

## 1. Product scope

Campus Connect is a college student community platform with seven modules:

1. Discover — find students with similar interests.
2. Communities — join societies, clubs, and groups.
3. Campus Feed — centralise scattered college information.
4. Opportunities — discover internships, events, and competitions.
5. Team Finder — find hackathon and project teammates.
6. Study Circles — find classmates and study partners.
7. Connections — build friendships and professional networks.

There are two roles: `STUDENT` and `ADMIN`. Students use the seven modules. Admins use one protected central dashboard to manage and moderate the platform.

This is not a dating app, college ERP, or WhatsApp replacement.

## 2. Technology stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Frontend language | JavaScript |
| Styling | CSS / CSS modules |
| Backend | Node.js + Express.js |
| API | REST |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password hashing | bcrypt or bcryptjs |
| Image storage | Cloudinary |
| File upload middleware | Multer |
| Package manager | npm |
| API testing | Thunder Client or Postman |

Use a modular monolith. Do not introduce microservices or unnecessary infrastructure.

## 3. Recommended repository layout

```text
campus-connect/
│
├── README.md
├── idea.md
├── structure.md
├── agent.md
├── .gitignore
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── assets/
│       │   ├── images/
│       │   └── icons/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   └── cards/
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   └── ForgotPassword.jsx
│       │   ├── student/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Discover.jsx
│       │   │   ├── Communities.jsx
│       │   │   ├── CampusFeed.jsx
│       │   │   ├── Opportunities.jsx
│       │   │   ├── TeamFinder.jsx
│       │   │   ├── StudyCircles.jsx
│       │   │   ├── Connections.jsx
│       │   │   ├── Profile.jsx
│       │   │   └── Settings.jsx
│       │   └── admin/
│       │       ├── AdminLogin.jsx
│       │       └── AdminDashboard.jsx
│       ├── features/
│       │   ├── auth/
│       │   ├── discover/
│       │   ├── communities/
│       │   ├── feed/
│       │   ├── opportunities/
│       │   ├── teams/
│       │   ├── study-circles/
│       │   └── connections/
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   └── feature services
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       ├── utils/
│       └── styles/
│           ├── globals.css
│           ├── variables.css
│           └── layout.css
│
└── backend/
    ├── package.json
    ├── .env.example
    └── src/
        ├── server.js
        ├── app.js
        ├── config/
        │   ├── db.js
        │   └── cloudinary.js
        ├── middleware/
        │   ├── authMiddleware.js
        │   ├── roleMiddleware.js
        │   ├── uploadMiddleware.js
        │   ├── errorMiddleware.js
        │   └── notFoundMiddleware.js
        ├── utils/
        │   ├── ApiError.js
        │   ├── asyncHandler.js
        │   └── generateToken.js
        ├── modules/
        │   ├── auth/
        │   ├── users/
        │   ├── discover/
        │   ├── communities/
        │   ├── feed/
        │   ├── opportunities/
        │   ├── teams/
        │   ├── study-circles/
        │   ├── connections/
        │   ├── reports/
        │   └── admin/
        └── tests/
```

Each backend module should contain only the files it needs. A typical module may have a model, routes, controller, and service. Do not create empty boilerplate files for every possible layer.

## 4. Backend module responsibilities

| Module | Responsibility |
|---|---|
| `auth` | Student registration, login, token handling |
| `users` | Student account and profile management |
| `discover` | Student search, filters, interest-based suggestions |
| `communities` | Societies, clubs, membership and join requests |
| `feed` | Campus posts, categories, publishing and moderation |
| `opportunities` | Internships, events and competitions |
| `teams` | Project/hackathon listings, applications and teams |
| `study-circles` | Subject-based study groups and membership |
| `connections` | Connection requests and accepted connections |
| `reports` | Reports of inappropriate content or accounts |
| `admin` | Admin-only management and moderation endpoints |

Keep controllers focused on HTTP request/response handling. Put business logic in services. Use Mongoose models for database access.

## 5. MongoDB collections

Use MongoDB collections with Mongoose schemas. Suggested collections:

### Accounts and profiles
- `users`: `fullName`, `email`, `passwordHash`, `role`, `status`, `college`, `course`, `branch`, `yearOrSemester`, `bio`, `profileImage`, `interests`, `skills`, `createdAt`.
- `profileImage` should store the Cloudinary `secure_url` and `public_id`, not the image binary.

### Communities
- `communities`: `name`, `description`, `category`, `createdBy`, `status`, `createdAt`.
- `communityMemberships`: `community`, `user`, `membershipStatus`, `joinedAt`.

### Campus Feed
- `posts`: `author`, optional `community`, `title`, `content`, `category`, `media`, `status`, `createdAt`, `updatedAt`.
- Each media item can store a Cloudinary `secure_url` and `public_id`.

### Opportunities
- `opportunities`: `title`, `description`, `type`, `organiser`, `eligibility`, `deadline`, `eventDate`, `registrationUrl`, `status`, `createdBy`.

### Team Finder
- `teamPosts`: `createdBy`, `title`, `description`, `requiredSkills`, `teamSize`, `status`, `createdAt`.
- `teamApplications`: `teamPost`, `applicant`, `message`, `status`, `createdAt`.

### Study Circles
- `studyCircles`: `title`, `subject`, `description`, `createdBy`, `status`, `createdAt`.
- `studyCircleMemberships`: `studyCircle`, `user`, `membershipStatus`.

### Connections and moderation
- `connectionRequests`: `sender`, `receiver`, `status`, `createdAt`, `updatedAt`.
- `reports`: `reporter`, `targetType`, `targetId`, `reason`, `status`, `createdAt`.
- `adminActions`: `admin`, `actionType`, `targetType`, `targetId`, `notes`, `createdAt`.

Use MongoDB ObjectIds and Mongoose references where appropriate. Add indexes for commonly searched fields and compound unique indexes to prevent duplicate memberships, applications, or requests. Validate data in schemas and services. Never store passwords in plain text.

## 6. API route outline

Prefix API routes with `/api/v1`.

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/users

GET    /api/v1/discover/students

GET    /api/v1/communities
POST   /api/v1/communities
GET    /api/v1/communities/:id
POST   /api/v1/communities/:id/join

GET    /api/v1/posts
POST   /api/v1/posts

GET    /api/v1/opportunities

GET    /api/v1/teams
POST   /api/v1/teams
POST   /api/v1/teams/:id/apply

GET    /api/v1/study-circles
POST   /api/v1/study-circles
POST   /api/v1/study-circles/:id/join

GET    /api/v1/connections
POST   /api/v1/connections/requests
PATCH  /api/v1/connections/requests/:id

POST   /api/v1/reports

GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users
PATCH  /api/v1/admin/users/:id/status
GET    /api/v1/admin/reports
PATCH  /api/v1/admin/reports/:id
GET    /api/v1/admin/posts
PATCH  /api/v1/admin/posts/:id/status
GET    /api/v1/admin/opportunities
POST   /api/v1/admin/opportunities
PATCH  /api/v1/admin/opportunities/:id
```

This is a planning outline. Define exact request/response shapes and permissions while implementing each feature. Do not create every endpoint before its feature is built.

## 7. Frontend routes

```text
/login
/register
/forgot-password

/app
/app/discover
/app/communities
/app/feed
/app/opportunities
/app/team-finder
/app/study-circles
/app/connections
/app/profile
/app/settings

/admin/login
/admin
/admin/users
/admin/communities
/admin/feed
/admin/opportunities
/admin/reports
```

Use frontend route guards for user experience, but always enforce authorisation on the backend with Express middleware.

## 8. Cloudinary image upload flow

1. Student selects an image in the React frontend.
2. Frontend sends it as `multipart/form-data` to an authenticated Express endpoint.
3. Express validates MIME type and file size using Multer.
4. Backend uploads the file to Cloudinary using server-side credentials.
5. Backend stores the returned `secure_url` and `public_id` in MongoDB.
6. When replacing or deleting an image, backend deletes the old Cloudinary asset when appropriate.

Never expose Cloudinary API secrets to the frontend. Do not store image binaries in MongoDB.

## 9. Environment configuration

Use `backend/.env` locally and add it to `.gitignore`. Provide `backend/.env.example` with placeholders only:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/campus_connect
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

For MongoDB Atlas, use its connection string as `MONGODB_URI`. Never commit real credentials or secrets.

## 10. Local development ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: local service on `27017`, or MongoDB Atlas.

Configure CORS for the exact frontend origin. Do not use permissive production CORS settings.

## 11. Build order

1. Inspect the repository and create/preserve frontend and backend skeletons.
2. Set up Express and connect MongoDB using Mongoose.
3. Configure Cloudinary and secure environment variables.
4. Implement student registration, login, JWT authentication, and role-based access.
5. Implement student profiles.
6. Implement Discover and Connections.
7. Implement Communities and Campus Feed.
8. Implement Opportunities.
9. Implement Team Finder and Study Circles.
10. Implement the single Admin dashboard and moderation.
11. Test permissions, validation, upload flows, empty states, and end-to-end flows.

Build one vertical slice at a time: Mongoose model → service → controller → route → frontend service → page → test.
