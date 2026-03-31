# 📄 Document Organiser — Full-Stack Cloud Document Management System

<div align="center">

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.11-6DB33F?style=flat&logo=springboot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2.1-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-ECR%20%2F%20ECS-FF9900?style=flat&logo=amazonaws&logoColor=white)
![Jenkins](https://img.shields.io/badge/CI%2FCD-Jenkins-D24939?style=flat&logo=jenkins&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

**A production-ready, full-stack document management application with intelligent organisation, AI-powered features, real-time collaboration, and cloud-native AWS deployment.**

[Features](#-features) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Documentation](#-api-documentation) · [CI/CD](#-cicd--jenkins) · [Deployment](#-deployment)

</div>

---

## ✨ Features

### 📁 Document Management
- **Upload & Download** — Drag-and-drop file upload (up to 100MB), single-click download
- **Folder Organisation** — Nested folder hierarchy with colour-coded folders
- **Move & Copy** — Move/copy documents between folders via dialog picker or drag-and-drop
- **Rename & Delete** — In-place rename with soft-delete and 30-day trash retention
- **Favorites** — Star/unstar documents for quick access
- **Tags** — Attach and manage tags for categorisation
- **Versioning** — Document version history tracking

### 🤖 AI-Powered Features
- **Auto-Tagging** — Rule-based intelligent tag suggestions auto-applied to documents
- **Tag Suggestions** — Preview AI-suggested tags before applying
- **Document Summarisation** — Auto-generate summaries based on document metadata and content type
- **Smart Categorisation** — Automatic file-type detection via Apache Tika

### 🔍 Search & Discovery
- **Full-Text Search** — Search across document names, tags, and metadata
- **Category Browsing** — Auto-categorised views (Documents, Images, Videos, Audio, Archives, Code)
- **Recent Files** — Quick access to recently accessed documents
- **Smart Filters** — Sort by name, date, size, or type with ascending/descending toggle

### 📊 Dashboard & Analytics
- **Overview Dashboard** — Storage usage, document stats, category breakdown charts
- **Activity Feed** — Real-time activity logging for all operations (uploads, moves, deletes, shares)
- **Storage Widget** — Visual storage quota tracking per user (1GB default)

### 💬 Comments & Collaboration
- **Document Comments** — Threaded comments on any document with paginated loading
- **User Sharing** — Share documents with other users by email with permission control (VIEW/EDIT)
- **Public Share Links** — Generate tokenised public links with configurable permissions
- **Shared With Me** — Dedicated view for documents shared by others

### 🔔 Real-Time Notifications
- **Server-Sent Events (SSE)** — Push notifications delivered in real-time via `/notifications/stream`
- **Notification Centre** — In-app notification panel with read/unread state
- **Activity Audit Log** — Paginated audit trail for all user actions

### 📦 Export & Data Portability
- **ZIP Export** — Download all your documents as a single ZIP archive (GDPR-compliant data export)

### 🗑️ Trash & Recovery
- **Soft Delete** — Deleted items move to trash with 30-day auto-expiry
- **Restore** — One-click restore from trash to original location
- **Permanent Delete** — Manually purge items from trash
- **Empty Trash** — Bulk clear all trashed items

### 🛡️ Admin Panel
- **User Management** — Admin-only controller for platform-level user operations
- **Role-Based Access** — Spring Security role enforcement for admin vs. standard users

### 🎨 UI/UX
- **Dark/Light Theme** — System-aware theme switching via `next-themes`
- **Grid/List View** — Toggle between card grid and sortable table views
- **Drag & Drop** — Drag files from desktop to upload; drag documents onto folders to move
- **File Preview** — In-app preview for images, PDFs, videos, audio, and text files
- **Command Palette** — Quick navigation and actions via keyboard shortcut (⌘K)
- **Keyboard Shortcuts Panel** — Built-in shortcuts reference overlay
- **Onboarding Flow** — Guided first-run experience for new users
- **Responsive Design** — Fully responsive sidebar and content layout
- **Toast Notifications** — Real-time feedback for all operations via Sonner

### 🔐 Authentication & Security
- **JWT Authentication** — Access tokens (24h) + refresh tokens (7d)
- **Google OAuth2** — One-click Google sign-in via `@react-oauth/google`
- **Email/Password** — Traditional registration and login
- **Spring Security** — CSRF protection, CORS configuration, role-based access
- **NextAuth v5** — Session management with secure cookie handling
- **Rate Limiting** — Database-backed rate limiting on sensitive endpoints

---

## 🏗️ Architecture

```
                        Internet
                           │
                  ┌────────▼────────┐
                  │  Internet ALB   │   Public Subnets
                  │  (HTTPS/HTTP)   │
                  └────────┬────────┘
                           │
             ┌─────────────▼─────────────┐
             │   FRONTEND (Next.js 16)   │   Private Subnet Tier 1
             │   Standalone SSR Mode     │
             │   Port 3000               │
             │   ECS / Auto Scaling      │
             └─────────────┬─────────────┘
                           │ /api/backend/* rewrites
              ┌────────────▼────────────┐
              │    Internal ALB         │   Private Subnet Tier 2
              └────────────┬────────────┘
                           │
             ┌─────────────▼─────────────┐
             │   BACKEND (Spring Boot)   │   Private Subnet Tier 3
             │   REST API + JWT + SSE    │
             │   Port 8080               │
             │   ECS / Auto Scaling      │
             └──────┬──────────────┬─────┘
                    │              │
           ┌────────▼───┐   ┌─────▼──────┐
           │ PostgreSQL │   │   AWS S3    │
           │  (RDS)     │   │  (Storage)  │
           └────────────┘   └────────────┘
```

### API Context Path
- All backend endpoints are served under `/api/v1/` (e.g. `GET /api/v1/documents`)
- Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`
- Health check: `http://localhost:8080/api/v1/actuator/health`

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|:---|:---|:---|
| Java | 21 | Language runtime (Amazon Corretto) |
| Spring Boot | 3.5.11 | Application framework |
| Spring Security | 6.x | Authentication & authorisation |
| Spring Data JPA | 3.x | Database ORM & repositories |
| PostgreSQL | 16 | Relational database |
| Flyway | (managed by Spring Boot) | Database schema migrations |
| AWS SDK v2 | (BOM managed) | S3 storage integration |
| Apache Tika | 3.2.3 | File type detection |
| MapStruct | 1.6.3 | Entity ↔ DTO mapping |
| JJWT | 0.13.0 | JWT token generation & validation |
| SpringDoc OpenAPI | 2.8.16 | Swagger UI & API docs |
| Lombok | 1.18.42 | Boilerplate reduction |
| Gradle (Kotlin DSL) | 9.3.0 | Build tool |

### Frontend
| Technology | Version | Purpose |
|:---|:---|:---|
| Next.js | 16.2.1 | React SSR framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| shadcn/ui (Radix UI) | Latest | Accessible UI components |
| TanStack Query | 5.x | Server state & data fetching |
| Zustand | 5.x | Client-side state management |
| React Hook Form + Zod | 7.x / 4.x | Form handling & validation |
| Framer Motion | 12.x | Animations & transitions |
| NextAuth v5 | 5.0.0-beta | Session management |
| Recharts | 3.x | Dashboard charts |
| Sonner | 2.x | Toast notifications |
| ESLint | 10.x | Linting |
| Vitest | 4.x | Unit testing |

### Infrastructure & CI/CD
| Technology | Purpose |
|:---|:---|
| AWS ECR | Container image registry |
| AWS ECS / EC2 ASG | Container orchestration |
| AWS RDS (PostgreSQL) | Managed database |
| AWS S3 / MinIO (local) | Object storage |
| AWS ALB | Load balancing |
| Docker | Containerisation |
| Jenkins | CI/CD pipelines (`Jenkinsfile.backend`, `Jenkinsfile.frontend`) |

---

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** — for local infrastructure
- **Java 21** (Amazon Corretto recommended)
- **Node.js 22+** & npm
- **Google OAuth2** credentials (Client ID + Secret)

### 1. Clone the Repository

```bash
git clone https://github.com/DreamerX00/Full-Stack-Project-DocumentOrganiser.git
cd Full-Stack-Project-DocumentOrganiser
```

### 2. Start Infrastructure Services

```bash
docker compose up -d db minio
```

This starts:
- **PostgreSQL 16** on port `5433` (mapped from 5432 inside container)
- **MinIO** on port `9002` (API) and `9003` (console)

### 3. Backend Setup

```bash
cd DocumentOrganiser-Backend

# Create secrets file
cp src/main/resources/application-secrets.properties.example \
   src/main/resources/application-secrets.properties

# Edit with your credentials (PostgreSQL, JWT secret, Google OAuth2, MinIO keys)
nano src/main/resources/application-secrets.properties

# Run the backend (dev profile)
./gradlew bootRun
```

The backend starts at **http://localhost:8080/api/v1**

- Swagger UI: http://localhost:8080/api/v1/swagger-ui.html
- Health check: http://localhost:8080/api/v1/actuator/health

### 4. Frontend Setup

```bash
cd DocumentOrganiser-Frontend/document-organiser-frontend

# Install dependencies
npm ci

# Create environment file
cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-at-least-32-characters-long
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF

# Run development server
npm run dev
```

The frontend starts at **http://localhost:3000**

### 5. Full Docker Compose (Optional)

Run the entire stack locally (frontend + backend + PostgreSQL + MinIO):

```bash
# Copy and fill required env vars
cp .env.example .env   # set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, etc.

# Build and start everything
docker compose up --build
```

Access the app at **http://localhost:3000**

---

## 📡 API Documentation

All endpoints are documented in Swagger UI at `http://localhost:8080/api/v1/swagger-ui.html`.

### Core Endpoints

| Module | Base Path | Description |
|:---|:---|:---|
| **Auth** | `/api/v1/auth` | Register, login, Google OAuth2, token refresh |
| **Documents** | `/api/v1/documents` | CRUD, upload, download, preview, move, copy, favorite, tag, version history |
| **Folders** | `/api/v1/folders` | CRUD, nested hierarchy, move |
| **Search** | `/api/v1/search` | Full-text search with filters |
| **Sharing** | `/api/v1/shares` | User sharing, public link generation |
| **Trash** | `/api/v1/trash` | List, restore, permanent delete, empty trash |
| **Comments** | `/api/v1/documents/{id}/comments` | Threaded document comments (paginated) |
| **AI** | `/api/v1/ai/documents/{id}` | Auto-tag, suggest tags, generate summary |
| **Export** | `/api/v1/export/documents` | ZIP export of all user documents |
| **Dashboard** | `/api/v1/dashboard/stats` | Storage stats, recent activity |
| **Activity** | `/api/v1/activity` | Paginated activity/audit log |
| **Notifications** | `/api/v1/notifications` | List, mark read |
| **Notifications (SSE)** | `/api/v1/notifications/stream` | Real-time push via Server-Sent Events |
| **User** | `/api/v1/users` | Profile & settings management |
| **Admin** | `/api/v1/admin` | Admin-only user management (role-protected) |
| **Health** | `/api/v1/actuator/health` | Service health check |

### Response Envelope

All API responses follow a unified structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

Paginated responses include:

```json
{
  "content": [...],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 150,
  "totalPages": 8,
  "last": false
}
```

---

## 🔁 CI/CD — Jenkins

This project uses **Jenkins** with two dedicated pipeline files for independent backend and frontend builds.

### Pipeline Files

| File | Purpose |
|:---|:---|
| `Jenkinsfile.backend` | Backend CI (Gradle build + test) + ECR push on git tag |
| `Jenkinsfile.frontend` | Frontend CI (npm ci, lint, tsc, build) + ECR push on git tag |
| `Jenkinsfile` | Monorepo combined pipeline (parallel CI + tag-gated deploy) |

### How It Works

1. **Every push** — Detects which service changed (Backend or Frontend) and only builds/tests the affected service.
2. **On git tag** (e.g. `v1.2.0`) — Builds Docker image, logs into AWS ECR, and pushes three tags:
   - `:1.2.0` (version)
   - `:<commit-sha>` (8-char SHA)
   - `:latest`

### Agent Labels

| Label | Used For |
|:---|:---|
| `ec2-static-agent` | CI stages (Gradle builds, npm installs) |
| `docker-agent` | Docker build + ECR push stages |

### Jenkins Credentials Required

| Credential ID | Type | Used In |
|:---|:---|:---|
| `google-client-id` | Secret string | Frontend Docker build arg |
| `backend-internal-url` | Secret string | Frontend Docker build arg |

---

## 📂 Project Structure

```
Full-Stack-Project-DocumentOrganiser/
├── README.md                             ← You are here
├── AWS-DEPLOYMENT-GUIDE.md              ← Production AWS deployment guide
├── jenkins-pipeline-setup.md            ← Jenkins agent & job configuration guide
├── docker-compose.yml                   ← Full local stack (frontend + backend + DB + MinIO)
├── Jenkinsfile                          ← Monorepo Jenkins pipeline
├── Jenkinsfile.backend                  ← Standalone backend Jenkins pipeline
├── Jenkinsfile.frontend                 ← Standalone frontend Jenkins pipeline
│
├── DocumentOrganiser-Backend/           ← Spring Boot 3.5.11 REST API
│   ├── build.gradle.kts                 ← Kotlin DSL build file
│   ├── Dockerfile                       ← Multi-stage Docker build
│   ├── .gitignore                       ← Excludes .gradle-home, build/, etc.
│   └── src/main/java/.../
│       ├── config/                      ← Security, CORS, JWT, S3, OpenAPI, Rate-limit config
│       ├── controller/                  ← 18 REST controllers
│       │   ├── AiController             ← Auto-tag, summarise
│       │   ├── CommentController        ← Document comments
│       │   ├── ExportController         ← ZIP export (GDPR)
│       │   ├── NotificationSseController← Server-Sent Events
│       │   ├── AdminController          ← Admin user management
│       │   └── ... (Auth, Document, Folder, Search, Share, Trash, etc.)
│       ├── dto/                         ← Request/Response DTOs
│       ├── entity/                      ← JPA entities
│       ├── exception/                   ← Custom exceptions + global handler
│       ├── mapper/                      ← MapStruct entity-DTO mappers
│       ├── repository/                  ← Spring Data JPA repositories
│       ├── security/                    ← JWT filter, UserPrincipal, OAuth2 handler
│       ├── service/                     ← Business logic
│       └── util/                        ← File type utilities
│   └── src/main/resources/
│       ├── application.properties       ← Shared config (port 8080, context /api/v1)
│       ├── application-dev.properties   ← Local PostgreSQL, MinIO, Redis disabled
│       ├── application-prod.properties  ← AWS RDS, S3, strict CORS, validate DDL
│       └── db/migration/               ← Flyway SQL migrations
│
└── DocumentOrganiser-Frontend/          ← Next.js 16 App Router UI
    └── document-organiser-frontend/
        ├── package.json                 ← ESLint 10, Vitest 4, Next.js 16.2.1
        ├── Dockerfile                   ← Multi-stage standalone Next.js build
        └── src/
            ├── app/                     ← App Router pages
            │   ├── (auth)/login/        ← Login page
            │   ├── (dashboard)/         ← Dashboard layout + pages:
            │   │   ├── dashboard/       ←   Overview + stats
            │   │   ├── documents/       ←   File browser
            │   │   ├── folders/         ←   Folder management
            │   │   ├── search/          ←   Search results
            │   │   ├── favorites/       ←   Starred items
            │   │   ├── recent/          ←   Recently accessed
            │   │   ├── categories/      ←   Type-grouped browsing
            │   │   ├── shared/          ←   Shared with me
            │   │   ├── trash/           ←   Trash & recovery
            │   │   ├── notifications/   ←   Notification centre
            │   │   ├── activity/        ←   Audit log
            │   │   ├── settings/        ←   User settings
            │   │   └── admin/           ←   Admin panel
            │   ├── share/[token]/       ← Public share view (no auth required)
            │   ├── oauth2/              ← OAuth2 callback handler
            │   ├── privacy/             ← Privacy policy page
            │   ├── terms/               ← Terms of service page
            │   └── api/auth/            ← NextAuth API routes
            ├── components/
            │   ├── ui/                  ← shadcn/ui base components
            │   ├── layout/              ← TopNav, Sidebar, DashboardLayout, Breadcrumb
            │   └── features/            ← Feature components:
            │       ├── ai/              ←   AI actions (auto-tag, summarise)
            │       ├── comments/        ←   Comments panel
            │       ├── export/          ←   Export button
            │       ├── onboarding/      ←   First-run onboarding
            │       ├── shortcuts/       ←   Keyboard shortcuts panel
            │       └── ... (files, folders, search, share, notifications, auth)
            ├── lib/
            │   ├── api/                 ← API service modules (12+ modules)
            │   ├── hooks/               ← React Query hooks
            │   ├── store/               ← Zustand stores
            │   ├── types/               ← TypeScript type definitions
            │   ├── i18n/                ← Internationalisation setup
            │   └── utils/               ← Utility functions
            └── public/                  ← Static assets & service worker (sw.js)
```

---

## 🧪 Testing & Development

### Backend Tests

```bash
cd DocumentOrganiser-Backend
./gradlew test --no-daemon
```

Test results are published as JUnit XML under `build/test-results/`.

### Frontend Lint, Type Check & Tests

```bash
cd DocumentOrganiser-Frontend/document-organiser-frontend

npm run lint          # ESLint 10
npx tsc --noEmit      # TypeScript type check
npm test              # Vitest unit tests
npm run test:coverage # Coverage report
```

### Frontend Build

```bash
npm run build         # Next.js production build (standalone output)
```

---

## 🔧 Configuration

### Backend Profiles

| Profile | File | Usage |
|:---|:---|:---|
| `default` | `application.properties` | Port 8080, context `/api/v1`, Flyway, actuator |
| `dev` | `application-dev.properties` | Local PostgreSQL, MinIO, Redis disabled, CORS localhost |
| `prod` | `application-prod.properties` | AWS RDS, S3, strict CORS, `validate` DDL mode |
| `test` | (inline) | H2 or test containers for isolated test runs |

### Key Settings

| Setting | Default | Description |
|:---|:---|:---|
| Server Port | `8080` | Backend API port |
| Context Path | `/api/v1` | API base path |
| Max Upload Size | `100MB` | Maximum file upload size |
| JWT Expiration | `24 hours` | Access token lifetime |
| JWT Refresh | `7 days` | Refresh token lifetime |
| Storage Quota | `1GB` | Per-user storage limit (prod) |
| Trash Retention | `30 days` | Auto-delete trashed items |
| Rate Limiting | Database-backed | Prevents API abuse |

### Frontend Environment Variables

| Variable | Description |
|:---|:---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `NEXTAUTH_URL` | NextAuth canonical URL |
| `NEXTAUTH_SECRET` | NextAuth session secret (≥32 chars) |
| `GOOGLE_CLIENT_ID` | Server-side Google OAuth ID |
| `GOOGLE_CLIENT_SECRET` | Server-side Google OAuth secret |

---

## ☁️ Deployment

This project deploys to **AWS** using Docker containers stored in **ECR** and run on **ECS** or **EC2 Auto Scaling Groups**.

See **[AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md)** for full step-by-step instructions covering:

1. AWS Secrets Manager setup
2. IAM roles & instance profiles
3. ECR repository creation
4. Docker image build & push
5. Security groups (multi-tier)
6. Target groups & ALB configuration
7. ECS service / Launch templates & ASG
8. Google OAuth console redirect URI updates
9. End-to-end testing & health checks
10. Zero-downtime rolling deployments

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Akash Singh](https://github.com/DreamerX00)**

</div>
