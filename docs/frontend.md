# Campus Connect --- Frontend Specification

**Document type:** Frontend product, UX, and implementation
specification\
**Product:** Campus Connect\
**Tagline:** Your campus. Your people. Your opportunities.\
**Status:** Design direction approved; implementation details to be
validated with the backend\
**Frontend stack:** React + Vite + TypeScript

------------------------------------------------------------------------

## 1. Purpose

This document defines the frontend experience and implementation
expectations for Campus Connect. It translates the product scope in
`idea.md` and the approved **Maximalism** design direction into a
practical specification for frontend developers and AI coding agents.

The frontend should feel like a bold, expressive digital campus:
visually memorable, energetic, creative, and easy to use. It must not
look like a generic SaaS dashboard, Bootstrap template, or conventional
college ERP.

This document is the source of truth for frontend design and behavior.
The product scope in `idea.md` remains authoritative. Do not silently
add features that are not included in that document.

## 2. Product overview

Campus Connect is a college-focused student community platform that
brings students, societies, campus information, and opportunities
together in one place.

It helps students:

-   Discover people with similar interests.
-   Browse and join college societies, clubs, and interest groups.
-   Stay informed through campus announcements and society updates.
-   Find internships, events, workshops, competitions, and scholarships.
-   Find teammates for projects and competitions.
-   Join subject-based study groups and peer learning sessions.
-   Build friendships and professional networks through student
    connections.

Campus Connect is **not** a dating app, a college ERP, or a replacement
for every messaging and social-media platform.

### 2.1 Seven core modules

1.  Discover
2.  Communities
3.  Campus Feed
4.  Opportunities
5.  Team Finder
6.  Study Circles
7.  Connections

The application also includes public authentication pages, student
profile and settings, and one protected admin dashboard.

## 3. Frontend objectives

The frontend must:

-   Express the approved maximalist visual identity consistently.
-   Make all seven modules easy to discover and navigate.
-   Create a distinct visual personality for each module without
    fragmenting the brand.
-   Work across desktop, tablet, and mobile.
-   Keep forms, navigation, and functional information readable.
-   Provide clear loading, empty, success, and error feedback.
-   Use reusable components and centralized design tokens.
-   Separate student and admin experiences.
-   Integrate with the backend through documented REST APIs.
-   Avoid fake functionality and misleading success states.

## 4. Design direction --- Maximalism (strict requirement)

### 4.1 Visual philosophy

Campus Connect must follow a bold, expressive, modern maximalist design
philosophy.

The interface should use:

-   Bold and expressive visual compositions.
-   Strong typography and clear visual hierarchy.
-   Layered layouts and intentional depth.
-   Playful graphic elements.
-   A distinctive visual identity.
-   Creative use of whitespace and visual density.
-   Color-blocked sections and memorable page compositions.
-   Decorative details that support the product's personality.

Do not interpret maximalism as putting every color, shape, and
decoration on every screen. The design must be art-directed and
intentional. Each page should have a focal point, a clear reading order,
and enough visual structure to remain usable.

**Do not create:**

-   A minimal SaaS dashboard.
-   A generic Bootstrap interface.
-   A conventional corporate admin template.
-   An interface dominated by plain white cards on a grey background.
-   Excessive glassmorphism.
-   Random gradients or decorative noise.
-   Inconsistent radii, shadows, or border styles.
-   Unreadable typography or low-contrast text.
-   Decorative elements that obstruct controls or content.

### 4.2 Approved color palette

Use this palette as the shared brand foundation.

  -----------------------------------------------------------------------
  Color token             Hex value               Intended role
  ----------------------- ----------------------- -----------------------
  Electric Blue           `#3155FF`               Primary brand color,
                                                  key actions, selected
                                                  navigation

  Vivid Orange            `#FF6B35`               Energy accents,
                                                  highlights, selected
                                                  module moments

  Bright Yellow           `#FFD93D`               Attention accents,
                                                  stickers, callouts

  Hot Pink                `#FF4F9A`               Expressive highlights
                                                  and selected decorative
                                                  surfaces

  Deep Purple             `#6336C9`               Secondary brand
                                                  surfaces and visual
                                                  depth

  Cream                   `#FFF8E7`               Warm page backgrounds
                                                  and soft content
                                                  surfaces

  Ink Black               `#171717`               Main text, strong
                                                  outlines, high-contrast
                                                  elements

  White                   `#FFFFFF`               Text or surfaces where
                                                  contrast and clarity
                                                  require it
  -----------------------------------------------------------------------

Rules:

-   Use colors strategically, not all at once.
-   Choose a dominant surface color and one or two accent colors per
    composition.
-   Use Ink Black for strong outlines where appropriate.
-   Preserve accessible contrast for text, icons, and controls.
-   Never communicate status using color alone; include labels, icons,
    or text.
-   Define all colors as design tokens so the palette can be tuned
    centrally.

### 4.3 Typography

Typography is a primary visual element, not merely a way to label
components.

Suggested font roles:

-   **Archivo Black:** expressive display headlines and selected
    high-impact titles.
-   **Space Grotesk:** interface headings, navigation, and prominent
    labels.
-   **Inter:** body copy, forms, tables, metadata, and dense functional
    content.

Use oversized editorial headlines where the content supports them.
Combine expressive display typography with readable body typography.

Guidelines:

-   Use bold weights and strong contrast.
-   Establish a consistent type scale.
-   Use display type for page titles, hero statements, and selected
    feature moments.
-   Keep labels, form fields, metadata, and long descriptions practical
    and readable.
-   Avoid oversized typography inside dense tables or operational admin
    screens.
-   Load fonts reliably and provide sensible fallback fonts.

Suggested initial scale (adjust responsively):

  Text role                Suggested size
  ---------------------- ----------------
  Editorial hero title          48--72 px
  Page title                    36--48 px
  Section title                 24--32 px
  Card title                    18--22 px
  Body                          14--16 px
  Supporting text               12--14 px
  Form label                    13--15 px

### 4.4 Shape, borders, and depth

Use a coherent visual language built from:

-   Thick-bordered cards.
-   Strong, deliberate outlines.
-   Offset shadows.
-   Layered surfaces.
-   Color-blocked panels.
-   Distinctive profile and content cards.
-   Expressive buttons.
-   Decorative stickers and badges.

Create a small, consistent set of border widths, corner radii, and
shadow tokens. Not every card needs the same treatment, but variations
must feel intentional and belong to the same design system.

### 4.5 Layout composition

-   Use editorial-style asymmetric compositions where useful.
-   Avoid making every page a uniform grid of identical cards.
-   Establish one or two strong visual focal points per page.
-   Vary card sizes and placements when that improves hierarchy.
-   Use whitespace deliberately to balance visual density.
-   Keep content alignment, navigation, and interaction patterns
    predictable.
-   Ensure decorative layers never cover text, controls, or focus
    indicators.
-   Make responsive behavior part of each composition rather than
    shrinking a desktop design.

### 4.6 Illustrations and decorative elements

Use decorative stickers, graphic shapes, patterns, and illustrated empty
states selectively.

They should: - Reinforce the campus/community personality. - Help
distinguish sections or communicate a state. - Remain secondary to
functional content. - Avoid implying functionality that does not
exist. - Have no negative impact on accessibility or performance.

Do not use random stock illustrations as filler. Any imagery should have
a consistent art direction.

## 5. Module-specific visual identity

Each of the seven modules should have a recognizable visual character
while using the same brand tokens, typography, navigation, and component
behavior.

  -----------------------------------------------------------------------
  Module                  Experience direction    Visual opportunities
  ----------------------- ----------------------- -----------------------
  Discover                Creative student        Distinctive profile
                          directory               cards, interest tags,
                                                  bold search area,
                                                  expressive filters

  Communities             Collection of campus    Varied community cards,
                          clubs                   club identity colors,
                                                  visual category markers

  Campus Feed             Energetic campus        Editorial post layouts,
                          noticeboard             announcement emphasis,
                                                  image-led content where
                                                  available

  Opportunities           Curated opportunity     Strong opportunity
                          magazine                headlines, deadline
                                                  labels, category
                                                  accents, featured
                                                  listings

  Team Finder             Creative collaboration  Project request cards,
                          board                   skill tags,
                                                  open-position
                                                  indicators, clear
                                                  application actions

  Study Circles           Visual learning         Subject-led sections,
                          community               topic labels, group
                                                  cards, learning-focused
                                                  illustrations

  Connections             Personal student        Profile-led layouts,
                          network                 clear request states,
                                                  expressive but
                                                  understandable
                                                  connection actions
  -----------------------------------------------------------------------

Module-specific styling must not create seven unrelated applications.
Reuse shared design tokens and interaction patterns.

## 6. User roles and experience

### 6.1 Student

Students can:

-   Register and log in.
-   Create and update a student profile.
-   Use all seven core modules.
-   Create permitted posts, groups, and team requests.
-   Send and manage connection requests.
-   Report inappropriate content.
-   Manage supported account settings and log out.

### 6.2 Admin

Administrators use one protected dashboard to:

-   View basic platform statistics.
-   Manage student accounts.
-   Manage communities and society listings.
-   Review and moderate campus feed posts.
-   Manage opportunities and events.
-   Review reports and moderate content.

Admin accounts must not be created through public student registration.

### 6.3 Authorization principles

-   The backend is the authority for authentication and permissions.
-   Frontend route guards are for user experience, not security.
-   Every admin API operation must be independently authorized by the
    backend.
-   Never trust a role supplied by an editable client-side field.
-   Handle expired sessions, unauthorized access, and forbidden
    operations consistently.

## 7. Information architecture and routes

### 7.1 Public routes

  Route                Page
  -------------------- ----------------------
  `/login`             Login
  `/register`          Student registration
  `/forgot-password`   Password recovery

### 7.2 Student routes

  Route                                 Page
  ------------------------------------- --------------------------
  `/app/discover`                       Discover students
  `/app/communities`                    Community listing
  `/app/communities/:communityId`       Community details
  `/app/feed`                           Campus Feed
  `/app/opportunities`                  Opportunity listing
  `/app/opportunities/:opportunityId`   Opportunity details
  `/app/team-finder`                    Team Finder listing
  `/app/team-finder/:requestId`         Team request details
  `/app/study-circles`                  Study Circle listing
  `/app/study-circles/:circleId`        Study Circle details
  `/app/connections`                    Connections and requests
  `/app/profile`                        My profile
  `/app/settings`                       Account settings

### 7.3 Admin routes

  Route                    Page
  ------------------------ ------------------------
  `/admin`                 Admin overview
  `/admin/students`        Student management
  `/admin/communities`     Community management
  `/admin/feed`            Feed moderation
  `/admin/opportunities`   Opportunity management
  `/admin/reports`         Reports and moderation

The root route `/` should direct unauthenticated users to login and
authenticated users to the correct role-based landing page.

## 8. Application shells and navigation

### 8.1 Student shell

The student application should feel like entering a vibrant digital
campus.

Desktop structure:

-   Persistent left navigation with Campus Connect identity.
-   Seven primary module links in the order defined in `idea.md`.
-   Clear active-route treatment using a bold indicator or color-blocked
    navigation state.
-   Main content region with a strong page heading and relevant actions.
-   Account menu for profile, settings, and logout.
-   Optional contextual content region only where it adds value.

Mobile structure:

-   Compact top bar.
-   Accessible mobile navigation for primary modules.
-   Account access that does not consume excessive screen space.
-   Responsive page layouts with no forced desktop sidebar.
-   Touch-friendly controls and menus that fit within the viewport.

### 8.2 Admin shell

The admin experience must retain the maximalist brand identity while
prioritizing operational clarity.

Use: - One central admin dashboard. - Clear navigation for overview,
students, communities, feed, opportunities, and reports. - Dense but
readable tables and management lists. - Strong page titles and
restrained brand accents. - Clear status labels and action hierarchy. -
Confirmation for destructive actions.

Do not create separate dashboards for each admin content type. Do not
let decorative maximalism reduce the speed or accuracy of administrative
work.

### 8.3 Navigation behavior

-   Active route must be obvious.
-   Browser back and forward navigation must work.
-   Deep links must work after refresh.
-   Unknown routes must show a not-found page.
-   Unauthorized routes must show an access-denied state or redirect
    appropriately.
-   Navigation must be keyboard accessible.

## 9. Page-level requirements

### 9.1 Login

Required: - Campus Connect identity and tagline. - College email. -
Password with show/hide control. - Forgot password link. - Login
action. - Link to student registration. - Field validation and API error
feedback.

Design direction: - Use a bold editorial introduction or graphic panel
alongside a clear, readable login form. - Decorative elements must not
compete with form completion.

Behavior: - Validate required fields. - Prevent duplicate submissions. -
Show useful invalid-credential feedback without revealing sensitive
account details. - Redirect according to the authenticated role returned
by the backend.

### 9.2 Student registration

Fields defined in `idea.md`: - Full name. - College email. - Password. -
Confirm password. - College. - Course / branch. - Academic year or
semester.

Behavior: - Mark required fields clearly. - Validate email format and
password requirements. - Confirm password matches. - Show field-level
errors. - Do not provide an admin role selector. - Follow the agreed
backend email-verification and onboarding flow.

The source idea does not decide whether college email verification is
mandatory. Confirm this before finalizing the flow.

### 9.3 Forgot password

Required: - College email field. - Recovery request action. -
Return-to-login link. - Neutral confirmation state that does not
disclose whether an account exists.

The recovery flow depends on backend email delivery and reset-token
support. Do not simulate a successful password reset without backend
support.

### 9.4 Discover

Required: - Search by student. - Filters for interests, skills, course,
and year. - Student result cards. - Empty, loading, and error states.

Student cards may show: - Profile image or initials. - Full name. -
Course / branch and academic year. - Short bio. - Selected interests and
skills. - Connection status and relevant action.

Do not display passwords, tokens, or private contact information. Do not
show the current user's profile as a result unless explicitly intended.

### 9.5 Communities

Listing: - Search and supported category filters. - Community cards with
name, description, image, and membership information where available. -
View details and join actions.

Details: - Community identity and description. - Activities and
updates. - Membership information. - Join or leave action according to
agreed rules.

Clearly distinguish joined and not-joined states. Do not invent approval
workflows.

### 9.6 Campus Feed

Required: - Feed list. - Post composer for permitted users. - Author and
timestamp. - Text and optional image. - Community or organiser context
where available. - Report action. - Loading, empty, and error states.

Behavior: - Validate content before submission. - Show image upload
progress. - Support pagination if the API supports it. - Do not imply
real-time updates unless implemented. - Comments, likes, direct
messages, and reactions are outside the defined MVP unless separately
approved.

### 9.7 Opportunities

Supported types: - Internships. - Events. - Workshops. - Competitions. -
Scholarships.

Listing: - Search and type filters. - Opportunity cards. - Title and
organiser. - Short description. - Deadline where available. -
Eligibility where available. - Registration link where available.

Details: - Full description. - Eligibility. - Dates and deadline. -
Organiser. - Registration link or application action.

Clearly distinguish expired listings. Never invent missing deadlines or
eligibility. Do not show a misleading action if no registration link
exists.

### 9.8 Team Finder

Listing: - Search and filters. - Project/team request cards. - Project
or competition title. - Description. - Required skills. - Request
owner. - Available positions where supported. - Details and apply
action.

Create request fields: - Title. - Description. - Project or competition
context. - Required skills. - Number of teammates/open positions if
supported. - Optional deadline if relevant.

Details: - Full request information. - Required skills. - Owner
information. - Application action. - Status where available.

Applying must not be represented as automatic team membership. Prevent
duplicate applications and clearly display closed or filled requests.

### 9.9 Study Circles

Listing: - Search. - Subject filters. - Study Circle cards. - Subject or
topic. - Description. - Creator or organiser. - Participation
information where available. - Join and details actions.

Details: - Circle name and subject. - Description and learning goals. -
Group information. - Membership action. - Session details only if
supported.

Do not introduce voice calls, video calls, or a full chat system.

### 9.10 Connections

Organize the page into: - Incoming requests. - Sent requests. - Accepted
connections.

Show student identity and a concise profile summary. Provide
accept/reject actions for incoming requests and cancellation for sent
requests if supported.

Reflect only server-confirmed status changes. Prevent duplicate requests
and make pending, accepted, rejected, and cancelled states
understandable.

### 9.11 Student profile

Display: - Full name. - Profile image. - College. - Course / branch. -
Academic year or semester. - Bio. - Interests. - Skills.

Allow the profile owner to edit supported fields. Provide image upload
progress and failure feedback. Follow backend privacy rules when showing
another student's profile.

### 9.12 Settings

Initial scope: - View account details. - Update supported
profile/account fields. - Log out.

Password changes, notification preferences, privacy controls, and
account deletion are not defined in `idea.md`. Do not add them without
product and backend agreement.

### 9.13 Admin overview

Show only real backend-supported statistics and useful management
summaries. Do not use fake numbers, decorative charts, or placeholder
metrics presented as real data.

### 9.14 Admin students

Provide a searchable student table or responsive management list,
relevant academic details, account status where supported, pagination
where needed, and permitted actions.

Avoid exposing sensitive account data. Do not implement suspension or
deletion until policy and backend behavior are defined.

### 9.15 Admin communities

Provide community listing, search, details, and create/edit/remove
actions according to backend permissions. Confirm destructive actions
and reflect server-confirmed changes.

### 9.16 Admin feed moderation

Show posts available for review, author and content, report context
where relevant, and supported moderation actions. Do not remove content
from the interface before the backend confirms the operation.

### 9.17 Admin opportunities

Provide opportunity listing, search/type filters, create/edit forms,
deadline and eligibility fields, registration link, and supported
publish/remove actions. Validate dates and URLs.

### 9.18 Admin reports

Show report list, reported content/account reference, reason, submission
time, review status, and supported moderation actions. Do not invent
report categories or escalation workflows.

## 10. Reusable component system

Build reusable components with consistent visual treatment and clear
props. Components should not contain unrelated module API calls or
hidden business logic.

### 10.1 Layout components

-   `AppShell`
-   `StudentSidebar`
-   `AdminSidebar`
-   `MobileNavigation`
-   `TopBar`
-   `PageHeader`
-   `AccountMenu`
-   `ProtectedRoute`
-   `RoleGuard`

### 10.2 Content components

-   `StudentCard`
-   `CommunityCard`
-   `PostCard`
-   `OpportunityCard`
-   `TeamRequestCard`
-   `StudyCircleCard`
-   `ConnectionCard`
-   `StatCard`
-   `DataTable`
-   `StatusBadge`
-   `Avatar`

### 10.3 Form components

-   `TextField`
-   `PasswordField`
-   `SearchField`
-   `SelectField`
-   `TextareaField`
-   `MultiSelectField` where required
-   `ImageUploader`
-   `FormActions`

### 10.4 Feedback components

-   `LoadingSpinner`
-   `Skeleton`
-   `EmptyState`
-   `ErrorState`
-   `InlineAlert`
-   `Toast`
-   `ConfirmDialog`
-   `Pagination`

### 10.5 Maximalist component rules

-   Cards may use thick borders, offset shadows, and controlled color
    blocking.
-   Buttons should be expressive but immediately recognizable as
    interactive controls.
-   Badges and stickers should communicate category, status, or useful
    emphasis.
-   Empty states may use illustrations or graphic compositions.
-   Navigation should use bold active states with clear labels.
-   Use asymmetric grids for selected editorial sections, not for every
    data list.
-   Keep forms and tables calmer than promotional/expressive areas.
-   Every component must have default, hover, focus-visible, active,
    disabled, and relevant loading/error states.

## 11. Frontend architecture

### 11.1 Technology baseline

The product idea specifies React + Vite. This specification recommends
TypeScript for maintainability.

Recommended frontend tools: - React + Vite + TypeScript. - React
Router. - Axios or Fetch through one centralized API layer. - Lucide
React for icons. - Tailwind CSS or a consistent CSS Modules approach for
styling.

Choose one styling approach deliberately. Do not combine multiple
styling systems without a clear need. The exact library choices should
be confirmed during project setup.

### 11.2 Suggested folder structure

``` text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── auth/
│   │   ├── discover/
│   │   ├── communities/
│   │   ├── feed/
│   │   ├── opportunities/
│   │   ├── team-finder/
│   │   ├── study-circles/
│   │   ├── connections/
│   │   ├── profile/
│   │   └── admin/
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── validation/
│   │   └── utils/
│   ├── types/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
└── package.json
```

Keep feature-specific pages, components, hooks, and types inside their
feature folder. Put only genuinely reusable components in shared
component directories.

### 11.3 API integration

-   Communicate with the backend through REST APIs.
-   Centralize the API base URL and request configuration.
-   Do not duplicate URL construction or authentication logic in feature
    components.
-   Use environment variables for public frontend configuration.
-   Never expose database credentials, Cloudinary secrets, JWT signing
    secrets, or other server secrets in frontend environment variables.
-   Match TypeScript request/response types to the agreed backend API
    contract.
-   Handle network errors, validation errors, unauthorized responses,
    forbidden responses, and server failures consistently.

Example local environment variable:

``` env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 11.4 Authentication and session handling

The backend must authenticate credentials and enforce permissions.

Agree with backend implementation whether JWTs are delivered through
secure HttpOnly cookies or another reviewed approach. Do not casually
store long-lived authentication tokens in `localStorage`.

Frontend requirements: - Maintain a clear authenticated-user state. -
Obtain role information from a trusted backend response. - Protect
student and admin routes. - Handle expired or invalid sessions. - Clear
client-side user state on logout. - Avoid rendering protected content
while authentication status is unresolved. - Never treat a client-side
role check as backend authorization.

### 11.5 State management

-   Use local component state for local UI behavior.
-   Use shared application state for authenticated user/session
    information.
-   Use server-state caching only where it provides a clear benefit.
-   Avoid introducing a large global state library without a
    demonstrated need.

## 12. Data and interaction states

Every server-driven page must support:

  -----------------------------------------------------------------------
  State                               Expected behavior
  ----------------------------------- -----------------------------------
  Initial loading                     Show an appropriate skeleton or
                                      loading indicator

  Success                             Render server-returned data

  Empty                               Explain that no results exist and
                                      offer a relevant next action

  Error                               Show a clear message and retry
                                      where appropriate

  Submitting                          Prevent duplicate submissions and
                                      show progress

  Success action                      Confirm only after server success

  Validation error                    Show actionable field-level
                                      feedback

  Unauthorized                        Redirect or show an access-denied
                                      state
  -----------------------------------------------------------------------

Additional requirements: - Confirm destructive actions. - Keep keyboard
focus visible. - Support Escape to close dialogs where appropriate. -
Return focus to the triggering control after closing a dialog. - Prevent
background interaction while a modal is open. - Show image upload
progress and failures. - Do not use browser alerts as the main
notification system.

## 13. Responsive behavior

Use these initial design targets:

  -----------------------------------------------------------------------
  Viewport                            Expected behavior
  ----------------------------------- -----------------------------------
  Below 480 px                        Single-column content, compact
                                      navigation, touch-friendly controls

  480--767 px                         Mobile-first layouts and responsive
                                      forms

  768--1023 px                        Compact navigation and adaptable
                                      compositions

  1024--1439 px                       Full student/admin shell and
                                      editorial layouts where useful

  1440 px and above                   Constrained content widths; avoid
                                      stretched text and cards
  -----------------------------------------------------------------------

Requirements: - No unintended horizontal scrolling. - Tables need a
deliberate narrow-screen treatment. - Forms must remain usable on
mobile. - Dialogs must fit within the viewport. - Tap targets must be
comfortably sized. - Asymmetric desktop compositions must reflow into
understandable mobile layouts. - Decorative shapes must not obscure
content or controls.

## 14. Accessibility

Aim for WCAG 2.2 AA practices where practical.

-   Use semantic HTML.
-   Associate labels with form controls.
-   Support keyboard navigation.
-   Provide visible focus indicators.
-   Maintain sufficient contrast, especially on vibrant color surfaces.
-   Use meaningful alternative text for informative images.
-   Mark decorative images appropriately.
-   Do not rely on color alone to communicate state.
-   Announce important asynchronous feedback to assistive technology.
-   Give dialogs accessible names and predictable focus behavior.
-   Use buttons for actions and links for navigation.
-   Respect reduced-motion preferences.

Maximalist styling must never be used as an excuse to reduce
accessibility.

## 15. Performance and quality

-   Lazy-load route-level pages where appropriate.
-   Optimize image sizes and formats.
-   Avoid unnecessarily large image uploads.
-   Paginate or deliberately load large lists.
-   Prevent avoidable repeated API calls.
-   Keep dependencies limited and maintained.
-   Avoid expensive decorative animations.
-   Respect reduced-motion settings.
-   Verify production builds before demonstration.
-   Provide fallback UI for unexpected rendering errors.

## 16. Frontend security expectations

Frontend validation improves usability but does not replace backend
security.

-   Never embed secrets in frontend source or `VITE_` variables.
-   Never expose passwords, password hashes, JWT secrets, or private
    user data.
-   Do not trust client-side role checks as authorization.
-   Validate input on the client and independently on the server.
-   Render user-generated content safely; do not inject arbitrary HTML.
-   Validate uploaded file type and size on both frontend and backend.
-   Use safe external-link handling.
-   Avoid logging tokens or sensitive user information.
-   Ensure logout clears client-side session state and invokes the
    agreed backend logout behavior.

## 17. MVP implementation order

Follow the phases in `idea.md`.

### Phase 1 --- Foundation and authentication

-   Initialize React + Vite.
-   Configure routing and application shells.
-   Establish the maximalist design tokens and reusable UI foundations.
-   Build login, registration, and the agreed password recovery flow.
-   Implement role-aware routing and session handling.
-   Build student profile viewing and editing.
-   Establish the protected admin shell.

**Exit criteria:** Students and admins can access only their permitted
areas, with backend authorization in place.

### Phase 2 --- Core student experience

-   Discover students.
-   Connection requests and management.
-   Community listing, details, and membership.
-   Campus Feed listing and permitted post creation.
-   Reporting action where supported.

**Exit criteria:** The main discovery, community, feed, and connection
journeys work with real backend data.

### Phase 3 --- Opportunities and collaboration

-   Opportunity listing and details.
-   Team Finder listing, request creation, and application flow.
-   Study Circle listing, details, and membership flow.

**Exit criteria:** Each module supports its agreed primary user journey
and all required states.

### Phase 4 --- Admin dashboard and moderation

-   Admin overview with real statistics.
-   Student management.
-   Community management.
-   Feed moderation.
-   Opportunity management.
-   Reports and moderation actions.

**Exit criteria:** Admin operations are protected by backend permissions
and reflect server-confirmed changes.

### Phase 5 --- Testing and polish

-   Test all seven student modules.
-   Test student/admin route permissions.
-   Test authentication and session expiry.
-   Test image upload and replacement.
-   Test responsive layouts.
-   Test form validation and API failures.
-   Complete loading, empty, and error states.
-   Check accessibility and keyboard navigation.
-   Prepare realistic demonstration data.

**Exit criteria:** The MVP works reliably across supported screen sizes
and can be demonstrated without fake frontend functionality.

## 18. Acceptance checklist

### Structure and routing

-   [ ] Application starts with documented commands.
-   [ ] All documented routes exist.
-   [ ] Direct navigation and refresh work.
-   [ ] Student and admin shells are distinct.
-   [ ] Shared design tokens are centralized.

### Design direction

-   [ ] Maximalism is clearly expressed.
-   [ ] Approved palette is used consistently.
-   [ ] Typography has a clear editorial hierarchy.
-   [ ] Cards, borders, shadows, and decorative elements share a
    coherent language.
-   [ ] Each module has a recognizable visual character.
-   [ ] Admin pages remain efficient and readable.
-   [ ] Mobile layouts preserve hierarchy and usability.
-   [ ] No generic dashboard template or random decoration is used.

### Authentication

-   [ ] Student registration works through the backend.
-   [ ] Login works for valid credentials.
-   [ ] Invalid credentials show useful feedback.
-   [ ] Password confirmation is validated.
-   [ ] Public admin registration is unavailable.
-   [ ] Protected routes handle missing and expired sessions.
-   [ ] Logout clears authenticated application state.

### Student modules

-   [ ] Discover supports agreed search and filters.
-   [ ] Communities can be browsed and joined.
-   [ ] Campus Feed displays posts and supports permitted post creation.
-   [ ] Opportunities show available details and deadlines.
-   [ ] Team Finder supports requests and join applications.
-   [ ] Study Circles support browsing and agreed membership actions.
-   [ ] Connections support incoming, sent, and accepted states.

### Admin

-   [ ] Admin routes reject student users.
-   [ ] Student management respects permissions.
-   [ ] Community management works.
-   [ ] Feed moderation works.
-   [ ] Opportunity management works.
-   [ ] Reports can be reviewed.
-   [ ] Backend independently authorizes administrative operations.

### Quality

-   [ ] Data-driven pages have loading, empty, and error states.
-   [ ] Forms have validation and submission feedback.
-   [ ] Destructive actions have appropriate confirmation.
-   [ ] Layout works on mobile, tablet, and desktop.
-   [ ] Keyboard navigation and visible focus work.
-   [ ] No critical console errors or broken routes remain.

## 19. Product and implementation decisions still required

`idea.md` does not define the following details. Confirm them with the
product/backend team rather than inventing behavior:

  -----------------------------------------------------------------------
  Decision                            Why it matters
  ----------------------------------- -----------------------------------
  College email verification          Changes registration and account
                                      activation

  College selection source            Determines registration input and
                                      discovery filters

  Academic year format                Ensures consistent profile and
                                      filter values

  Profile visibility                  Defines which student fields others
                                      can see

  Community join rules                Determines instant membership vs
                                      approval

  Feed publishing permissions         Determines who can create posts

  Opportunity ownership               Confirms whether only admins create
                                      listings

  Team application lifecycle          Defines review, acceptance,
                                      rejection, withdrawal, and closure

  Study Circle membership             Defines open vs approval-based
                                      groups

  Connection state transitions        Defines duplicate, pending,
                                      rejected, cancelled, and accepted
                                      behavior

  Report reasons and actions          Defines moderation workflow

  Image upload limits                 Determines file validation and
                                      upload UX

  Pagination and sorting              Determines listing behavior and API
                                      contract

  Password recovery delivery          Requires backend email and
                                      reset-token support

  Notification scope                  Not currently defined in the MVP
  -----------------------------------------------------------------------

## 20. Scope boundaries

Do not add without explicit approval:

-   Dating or romantic matching.
-   Full WhatsApp replacement or direct messaging.
-   Voice or video calls.
-   Attendance, fees, examinations, or ERP functionality.
-   Complex AI recommendations.
-   Payments or marketplace features.
-   Public live-location tracking.
-   Unspecified social reactions or engagement systems.
-   Separate admin dashboards for individual modules.

## 21. Relationship to `idea.md`

This specification preserves the product overview, problem statement,
seven core modules, student/admin roles, registration fields,
navigation, technology stack, MVP phases, and exclusions in `idea.md`.

It adds the approved maximalist design direction, visual tokens,
typography, layout principles, module-specific visual identities, page
requirements, reusable components, responsive behavior, accessibility,
security expectations, and frontend acceptance criteria.

Where the product idea does not define a behavior, this document marks
it as a decision to confirm. It must not be treated as an
already-approved backend capability.

------------------------------------------------------------------------

**Implementation principle:** Build Campus Connect as a bold,
professionally art-directed maximalist digital campus. Keep the visual
identity expressive, but make every core journey clear, accessible,
responsive, and dependable.
