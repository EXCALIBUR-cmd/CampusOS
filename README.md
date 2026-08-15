# 🎓 CampusOS — Intelligent Campus ERP & Academic Gamification Platform

<p center>
  <strong>CampusOS</strong> is a next-generation, high-performance Enterprise Campus Resource Planning (ERP) and Academic Management Platform built with Next.js 15, React 19, Tailwind CSS, and MongoDB. It bridges academic management with modern gamification, AI assistance, and real-time performance analytics.
</p>

---

## 📋 Table of Contents

- [✨ Overview](#-overview)
- [🚀 Key Features](#-key-features)
  - [🛡️ Multi-Role Security \& RBAC](#️-multi-role-security--rbac)
  - [📊 Dynamic Dashboards](#-dynamic-dashboards)
  - [🤖 AI Command Center](#-ai-command-center)
  - [🏆 The Vault \& Gamification Engine](#-the-vault--gamification-engine)
  - [🎯 Missions \& Assignment Portal](#-missions--assignment-portal)
  - [📅 Smart Attendance \& Heatmaps](#-smart-attendance--heatmaps)
  - [🥇 Global Leaderboard (Hall of Fame)](#-global-leaderboard-hall-of-fame)
  - [🏫 Institutional Administration](#-institutional-administration)
  - [🎫 Support Ticket Hub](#-support-ticket-hub)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🗄️ Database Models](#️-database-models)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Getting Started](#-getting-started)
- [🌱 Database Seeding](#-database-seeding)
- [🔌 API Routes Reference](#-api-routes-reference)
- [📄 License](#-license)

---

## ✨ Overview

CampusOS transforms standard university administration into an engaging, interactive, and intelligent experience. By combining real-time academic tracking, automated assignment evaluation, geofenced/QR attendance records, and an XP-driven achievement engine, CampusOS enhances student engagement while empowering faculty and administrators with comprehensive oversight.

---

## 🚀 Key Features

### 🛡️ Multi-Role Security & RBAC
- **Edge Middleware Authentication**: JWT session verification running on Next.js Edge runtime.
- **Three Distinct User Roles**:
  - **Student**: Access to course materials, mission submissions, personal XP vault, attendance tracker, and global rank.
  - **Teacher / Faculty**: Course management, student grading, lecture creation, and manual/QR attendance logging.
  - **Administrator**: Institutional user CRUD, department management, global platform statistics, and support ticket management.
- **Automatic Header Injection**: Request routing automatically decorates authorized endpoints with `x-user-id` and `x-user-role`.

### 📊 Dynamic Dashboards
- **Student Dashboard**: Displays XP level progression, mastery curves via custom SVG analytics, 8-month GitHub-style attendance activity heatmap, global rank cards, and command audit feeds.
- **Faculty Dashboard**: Summarizes assigned courses, student counts, upcoming lectures, and direct shortcuts to attendance and course management.
- **Admin Dashboard**: System infrastructure metrics (users, courses, departments, open support tickets) and quick navigation tools.

### 🤖 AI Command Center
- **Multi-LLM Provider Support**: Configurable backends supporting **Google Gemini**, **Groq**, and **OpenAI**.
- **Context-Aware Assistance**: Directives tailored to student subjects (e.g., Data Structures, AI Ethics, Linear Algebra, Databases).
- **Persistent AI History**: Conversations saved per user in MongoDB (`AIConversation`).

### 🏆 The Vault & Gamification Engine
- **XP Progression System**: Students gain Experience Points (XP) through various actions:
  - Assignment Submission: `+450 XP`
  - Lecture Check-in: `+100 XP`
  - Attendance Streak: `+250 XP`
  - Event Participation: `+500 XP`
  - Club Participation: `+300 XP`
  - Resource Contribution: `+200 XP`
  - Achievement Unlock: `+1000 XP`
- **Dynamic Level Scaling**: Level automatically calculated (`Level = Math.floor(XP / 10,000) + 1`).
- **Automated Achievement Engine**: Evaluates criteria (assignments completed, check-in count, total XP) to unlock badges (*Code Warrior*, *Early Bird*, *Perfect Presence*, *Apex Scholar*) across Rarity Tiers (*Common*, *Rare*, *Legendary*).

### 🎯 Missions & Assignment Portal
- **Directive Filtering**: Filter assignments by `Pending`, `Complete`, or `Overdue` status.
- **File Upload Integration**: Integrated with **ImageKit API** for secure, high-speed document and code submissions.
- **Automated Reward Triggers**: Instant XP calibration upon verified completion.

### 📅 Smart Attendance & Heatmaps
- **Student Progress Rings**: Radial progress meters illustrating course-wise attendance percentages.
- **8-Month Heatmap Matrix**: GitHub-style activity grid visualizing lecture attendance intensity over time.
- **Faculty Attendance Logger**: Interface for teachers to bulk-mark or individually log attendance (Present, Absent, Late) per class session.

### 🥇 Global Leaderboard (Hall of Fame)
- **Competitive Ranking**: Displays overall top performers with XP counts, custom squad/guild tags, and user avatars.
- **Podium Display**: Highlighted top 3 rankers with unique podium styling.
- **Sticky Rank Card**: Instantly highlights the logged-in student's current global position.

### 🏫 Institutional Administration
- **User Management (`/admin`)**: Full CRUD operations for users, role assignments, department links, semester updates, and active status toggling.
- **Course Registry (`/courses-admin`)**: Course creation, credit assignments, instructor allocations, and student roster management.
- **Department Hub (`/departments-admin`)**: Department creation, HOD assignments, and student/faculty distribution overview.

### 🎫 Support Ticket Hub
- **Student & Faculty Ticketing**: Submit support queries for technical or academic issues.
- **Admin Response System**: Administrators view open tickets, reply to queries, and resolve issues.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.1](https://nextjs.org/) (App Router)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), Google Material Symbols, Geist Font, Custom Glassmorphism UI tokens
- **Database & ORM**: [MongoDB](https://www.mongodb.com/), [Mongoose 8.x](https://mongoosejs.com/)
- **Authentication**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Edge Middleware
- **AI Integrations**: `@google/generative-ai`, `groq-sdk`, `openai`
- **Media & File Storage**: [ImageKit SDK](https://imagekit.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 📁 Project Structure

```
CampusOS/
├── public/                     # Static assets and icons
├── src/
│   ├── app/                    # Next.js App Router routes & pages
│   │   ├── admin/              # User Management Portal
│   │   ├── ai-command/         # AI Command Center page
│   │   ├── api/                # API Endpoints (Auth, AI, Assignments, Vault, etc.)
│   │   ├── attendance/         # Smart Attendance page
│   │   ├── courses-admin/      # Course Management page
│   │   ├── dashboard/          # Dynamic Role Dashboards (Student/Faculty/Admin)
│   │   ├── departments-admin/  # Department Registry page
│   │   ├── leaderboard/        # Global Hall of Fame page
│   │   ├── missions/           # Assignments & Submissions page
│   │   ├── profile/            # User Profile page
│   │   ├── support/            # Support Ticket Hub page
│   │   ├── vault/              # Achievements & XP Vault page
│   │   ├── globals.css          # Design system, CSS variables & glassmorphic utilities
│   │   ├── layout.tsx          # Root Layout with dark-mode styling
│   │   └── page.tsx            # Login & Authentication Landing Page
│   ├── components/             # Reusable UI Components
│   │   ├── Header.tsx          # Top navigation header & user menu
│   │   ├── SideNavBar.tsx      # Sidebar navigation & brand logo
│   │   └── XPProgress.tsx      # Level & XP progress bar component
│   ├── lib/                    # Core Utilities & Configurations
│   │   ├── db.ts               # MongoDB Mongoose connection handler
│   │   ├── imagekit.ts         # ImageKit SDK client configuration
│   │   ├── jwt.ts              # JWT signing & verification helpers
│   │   └── seedData.ts         # Initial database seeding routines
│   ├── models/                 # Mongoose Data Schemas
│   │   ├── User.ts, Student.ts, Teacher.ts, Admin.ts
│   │   ├── Course.ts, Department.ts, Assignment.ts, AssignmentSubmission.ts
│   │   ├── Attendance.ts, AttendanceRecord.ts, Achievement.ts, Badge.ts
│   │   ├── XPTransaction.ts, Notification.ts, AIConversation.ts, SupportTicket.ts
│   │   └── index.ts
│   ├── services/               # Core Business Logic Engines
│   │   ├── achievementEngine.ts# Criteria checking & badge unlock logic
│   │   ├── xpEngine.ts         # XP calculation, level-ups, & notifications
│   │   ├── authService.ts      # Authentication & session services
│   │   ├── dashboardService.ts # Dynamic metric aggregation per role
│   │   ├── imagekitService.ts  # File upload handlers
│   │   └── ai/                 # Multi-provider AI services (Gemini, Groq, OpenAI)
│   └── middleware.ts           # Edge authentication & path protection middleware
├── .env.local                  # Environment configuration file
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Database Models

| Model | Description |
| :--- | :--- |
| **`User`** | System authentication credentials (email, hashed password, role: `student` / `teacher` / `admin`, `isActive`). |
| **`Student`** | Student profile details (name, roll number, department, semester, `totalXp`, `level`, linked `User`). |
| **`Teacher`** | Faculty profile details (name, department, designation, linked `User`). |
| **`Admin`** | Administrator profile details (name, department, designation, linked `User`). |
| **`Department`** | Department definitions (code, name, HOD reference). |
| **`Course`** | Course definitions (code, name, department, credits, assigned teachers, enrolled students). |
| **`Assignment`** | Academic mission/task (teacher, subject, title, description, due date, XP reward). |
| **`AssignmentSubmission`** | Student submission details (assignment, student, file URL, status, submission date). |
| **`Attendance`** | Class lecture session record (course, teacher, date, topic). |
| **`AttendanceRecord`** | Individual attendance check-in (attendance, student, status: `present`/`absent`/`late`). |
| **`Achievement`** | Gamified badge definition (name, description, XP reward, rarity, criteria type & target). |
| **`Badge`** | Student unlocked achievement instance. |
| **`XPTransaction`** | Audit log of earned XP points per action. |
| **`Notification`** | System, XP, and Achievement notifications delivered to users. |
| **`AIConversation`** | Stored history of AI prompt/response exchanges. |
| **`SupportTicket`** | User support tickets and admin resolution replies. |

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/campusos

# JWT Authentication Secret
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# AI Provider Configuration ("gemini" | "groq" | "openai")
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# ImageKit Integration for File Uploads
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **npm**, **pnpm**, or **yarn**

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/CampusOS.git
   cd CampusOS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.local` and update your connection strings and API keys.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open CampusOS in your Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🌱 Database Seeding

CampusOS includes automated data seeding for immediate testing:

- **Automatic Seeding**: Upon connecting to an empty database, CampusOS automatically seeds initial achievement badges, sample assignments, and a default faculty account.
- **Manual Endpoint Trigger**: You can manually trigger database seeding by hitting the endpoint:
  ```http
  GET /api/seed
  ```

### Default Faculty Credentials
- **Email**: `prof.nova@campusos.local`
- **Password**: `teacher123`
- **Role**: `teacher`

---

## 🔌 API Routes Reference

### Authentication
- `POST /api/auth/login` — Authenticate user and issue JWT cookie.
- `POST /api/auth/signup` — Register new student or user.
- `GET /api/auth/me` — Fetch currently authenticated user profile.
- `POST /api/auth/logout` — Clear session token.

### Dashboard & Analytics
- `GET /api/dashboard` — Aggregated role-specific metrics for Student, Faculty, or Admin.

### Gamification & Achievements
- `GET /api/vault` — Retrieve student XP progression, level, and unlocked/locked badges.
- `GET /api/leaderboard` — Fetch global and departmental rankings.

### Assignments & Missions
- `GET /api/assignments` — Fetch assignments for logged-in student/faculty.
- `POST /api/assignments` — Create a new assignment directive (Faculty).
- `POST /api/assignments/submit` — Submit assignment file and award XP.

### Attendance
- `GET /api/attendance` — Retrieve student attendance history or class roster.
- `POST /api/attendance` — Log class attendance (Faculty).

### AI Command Center
- `GET /api/ai` — Load conversation history.
- `POST /api/ai` — Transmit query directive to configured LLM matrix.

### Administration
- `GET /api/admin/users` — List users with pagination and search.
- `POST /api/admin/users` — Create or edit user accounts.
- `GET /api/courses` — List all courses.
- `POST /api/courses` — Create or update course details.
- `GET /api/departments` — List departments.
- `POST /api/departments` — Create or update department.
- `GET/POST /api/support` — Create, view, and reply to support tickets.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to customize and extend CampusOS for your institution!
