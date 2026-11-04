# Campus Connect

## 1. Product overview

**Campus Connect** is a college-focused student community platform that brings students, societies, campus information, and opportunities together in one place.

It helps students discover people with similar interests, join communities, stay informed about campus activities, find teammates, and connect with study partners.

The product is intentionally focused on the seven features below. It is not a dating app, a college ERP, or a replacement for every messaging and social-media platform.

**Tagline:** Your campus. Your people. Your opportunities.

## 2. The problem

College information and social connections are often scattered across WhatsApp groups, Instagram pages, notice boards, class groups, and word of mouth.

Students can miss events, competitions, internships, and society activities. Finding like-minded students, study partners, or reliable teammates can also take time.

## 3. Core features

### 3.1 Discover
Find students with similar interests through profile search and filters such as interests, skills, course, and year.

### 3.2 Communities
Browse and join college societies, clubs, and interest groups. View community details, activities, and updates.

### 3.3 Campus Feed
Centralise scattered college information, campus announcements, society updates, and event posts in one feed.

### 3.4 Opportunities
Discover internships, events, workshops, competitions, and scholarships. Show deadlines, eligibility, organisers, and registration links when available.

### 3.5 Team Finder
Find hackathon and project teammates. Students can publish project/team requests, list required skills, and receive join applications.

### 3.6 Study Circles
Find classmates and study partners through subject-based study groups and peer learning sessions.

### 3.7 Connections
Build friendships and professional networks through student connection requests and accepted connections.

## 4. User roles

### Student
- Register and log in.
- Create and update a student profile.
- Use all seven core modules.
- Create permitted posts, groups, and team requests.
- Send and manage connection requests.
- Report inappropriate content.

### Admin
- Access one protected admin dashboard.
- Manage student accounts.
- Manage communities and society listings.
- Review and moderate campus feed posts.
- Manage opportunities and events.
- Review reports and moderate content.
- View basic platform statistics.

Admin accounts must not be created through public student registration.

## 5. Authentication

### Student registration
Suggested fields:
- Full name
- College email
- Password
- Confirm password
- College
- Course / branch
- Academic year or semester

Students can complete their profile after registration with interests, skills, bio, and an optional profile image.

### Login
- College email
- Password
- Forgot password
- Link to registration

The backend must validate credentials and enforce role-based access.

## 6. Suggested navigation

Student navigation:
1. Discover
2. Communities
3. Campus Feed
4. Opportunities
5. Team Finder
6. Study Circles
7. Connections

Profile and settings can be available from the account menu.

The admin has one central dashboard with sections for overview, students, communities, feed, opportunities, and reports.

## 7. Technology stack

For a student project and a local laptop demonstration:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with bcrypt password hashing
- **Image uploads:** Cloudinary, handled securely through the Express backend
- **API style:** REST APIs

Start with a modular monolith. This is easier to build, test, and demonstrate than a microservices architecture.

## 8. MVP development order

### Phase 1 — Foundation and authentication
- Set up React + Vite and Express.
- Connect Express to MongoDB using Mongoose.
- Configure Cloudinary for image uploads.
- Create student and admin roles.
- Build registration and login.
- Implement JWT authentication and role-based access.
- Build the student profile.

### Phase 2 — Core student experience
- Discover students.
- Send and manage connections.
- Create and browse communities.
- Publish and browse campus feed posts.

### Phase 3 — Opportunities and collaboration
- Add opportunity listings.
- Add Team Finder posts and join requests.
- Add Study Circles and subject-based groups.

### Phase 4 — Admin dashboard and moderation
- Build the protected admin dashboard.
- Manage students, communities, posts, and opportunities.
- Review reports and moderate content.

### Phase 5 — Testing and polish
- Test registration and login.
- Test permissions for students and admins.
- Test image upload and replacement.
- Test all seven features.
- Add validation, empty states, error handling, and responsive layouts.
- Prepare sample data for the demonstration.

## 9. Scope boundaries

Do not add:
- Dating or romantic matching features.
- A full WhatsApp replacement.
- Voice or video calls.
- College attendance, fees, examinations, or ERP modules.
- Complex AI recommendations.
- Payments or marketplace features.
- Public live-location tracking.

## 10. Product summary

Campus Connect brings together students, communities, campus information, and opportunities in one place.

Its seven core modules are Discover, Communities, Campus Feed, Opportunities, Team Finder, Study Circles, and Connections. The application includes student registration and login, plus one secure admin dashboard for managing and moderating the platform.

**Core promise:** Everything happening in your campus, and the people who make it happen, in one place.
