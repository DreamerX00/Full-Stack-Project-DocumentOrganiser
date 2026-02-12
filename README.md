# 📄 Document Organiser — Full-Stack Cloud Document Management System

<div align="center">

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-6DB33F?style=flat&logo=springboot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-3--Tier-FF9900?style=flat&logo=amazonaws&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

**A production-ready, full-stack document management application with intelligent organisation, real-time collaboration, and cloud-native AWS deployment.**

[Features](#-features) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Documentation](#-api-documentation) · [Deployment](#-deployment)

</div>

---

## ✨ Features

### 📁 Document Management
- **Upload & Download** — Drag-and-drop file upload (up to 100MB), single-click download
- **Folder Organisation** — Nested folder hierarchy with colour-coded folders
- **Move & Copy** — Move/copy documents between folders via dialog picker or drag-and-drop
- **Rename & Delete** — In-place rename with soft-delete and 30-day trash retention
- **Favorites** — Star/unstar documents for quick access
- **Tags** — Attach tags to documents for categorisation

### 🔍 Search & Discovery
- **Full-Text Search** — Search across document names, tags, and metadata
- **Category Browsing** — Auto-categorised views (Documents, Images, Videos, Audio, Archives, Code)
- **Recent Files** — Quick access to recently accessed documents
- **Smart Filters** — Sort by name, date, size, or type with ascending/descending toggle

### 📊 Dashboard & Analytics
- **Overview Dashboard** — Storage usage, document stats, category breakdown charts
- **Activity Feed** — Real-time activity logging for all operations (uploads, moves, deletes, shares)
- **Storage Widget** — Visual storage quota tracking per user (1GB default)

### 🔗 Sharing & Collaboration
- **User-Based Sharing** — Share documents with other users by email with permission control (VIEW/EDIT)
- **Public Share Links** — Generate tokenised public links with configurable permissions
- **Shared With Me** — Dedicated view for documents shared by others

### 🗑️ Trash & Recovery
- **Soft Delete** — Deleted items move to trash with 30-day auto-expiry
- **Restore** — One-click restore from trash to original location
- **Permanent Delete** — Manually purge items from trash
- **Empty Trash** — Bulk clear all trashed items

### 🎨 UI/UX
- **Dark/Light Theme** — System-aware theme switching via `next-themes`
- **Grid/List View** — Toggle between card grid and sortable table views
- **Drag & Drop** — Drag files from desktop to upload; drag documents onto folders to move
- **File Preview** — In-app preview for images, PDFs, videos, audio, and text files
- **Command Palette** — Quick navigation and actions via keyboard shortcut (⌘K)
- **Responsive Design** — Fully responsive sidebar and content layout
- **Toast Notifications** — Real-time feedback for all operations

### 🔐 Authentication & Security
- **JWT Authentication** — Access tokens (24h) + refresh tokens (7d)
- **Google OAuth2** — One-click Google sign-in
- **Email/Password** — Traditional registration and login
- **Spring Security** — CSRF protection, CORS configuration, role-based access
- **NextAuth v5** — Session management with secure cookie handling

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
             │   Standalone SSR          │
             │   Port 3000               │
             │   Auto Scaling Group      │
             └─────────────┬─────────────┘
                           │ /api/backend/* → rewrites
              ┌────────────▼────────────┐
              │    Internal ALB         │   Private Subnet Tier 2
              └────────────┬────────────┘
                           │
             ┌─────────────▼─────────────┐
             │   BACKEND (Spring Boot)   │   Private Subnet Tier 3
             │   REST API + JWT          │
             │   Port 8080               │
             │   Auto Scaling Group      │
             └──────┬──────────────┬─────┘
                    │              │
           ┌────────▼───┐   ┌─────▼──────┐
           │ PostgreSQL │   │   AWS S3    │
           │  (RDS)     │   │  (Storage)  │
           └────────────┘   └────────────┘
```

### API Routing Flow
- **Browser** → `/api/backend/*` → **Next.js rewrites** → **Internal ALB** → **Spring Boot `/api/*`**
- **SSR (Server-Side)** → Directly calls Internal ALB via `NEXT_PUBLIC_API_URL`

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|:---|:---|:---|
| Java | 21 | Language runtime (Amazon Corretto) |
| Spring Boot | 3.4.2 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | Database ORM & repositories |
| PostgreSQL | 16 | Relational database |
| Flyway | Managed | Database migration management |
| AWS SDK v2 | 2.29.51 | S3 file storage |
| JJWT | 0.12.6 | JWT token generation & validation |
| Apache Tika | 3.1.0 | File type & MIME detection |
| MapStruct | 1.6.3 | DTO ↔ Entity mapping |
| Springdoc OpenAPI | 2.8.4 | Swagger API documentation |
| Lombok | 1.18.36 | Boilerplate reduction |
| Gradle | 9.3 | Build tool |

### Frontend
| Technology | Version | Purpose |
|:---|:---|:---|
| Next.js | 16.1.6 | React meta-framework (App Router, SSR) |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| NextAuth.js | 5.0.0-beta.30 | Authentication (JWT + OAuth) |
| TanStack React Query | 5.90.20 | Server state management & caching |
| Zustand | 5.0.11 | Client state management |
| Tailwind CSS | 4.x | Utility-first styling |
| shadcn/ui + Radix UI | Latest | Accessible UI component library |
| Axios | 1.13.5 | HTTP client |
| Recharts | 3.7.0 | Dashboard charts & analytics |
| Framer Motion | 12.34.0 | Animations & transitions |
| React Hook Form + Zod | Latest | Form handling & validation |
| Lucide React | 0.563.0 | Icon library |
| Sonner | 2.0.7 | Toast notifications |

### Infrastructure
| Technology | Purpose |
|:---|:---|
| AWS VPC | 3-tier network isolation |
| AWS ALB (x2) | Internet-facing + internal load balancing |
| AWS ASG (x2) | Auto-scaling for frontend & backend |
| AWS RDS | Managed PostgreSQL |
| AWS S3 | Object storage for documents |
| AWS Secrets Manager | Secure credential storage |
| AWS NAT Gateway | Internet access for private subnets |
| Docker Compose | Local development environment |
| MinIO | S3-compatible local object storage |

---

## 🚀 Getting Started

### Prerequisites
- **Java 21** (Amazon Corretto or Eclipse Temurin)
- **Node.js 22+** (recommended via `nvm`)
- **Docker & Docker Compose** (for database + MinIO)
- **Gradle 9.x** (included via wrapper)

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
- **PostgreSQL 16** on port `5432` (database: `docorganiser`)
- **MinIO** on port `9000` (API) and `9001` (console)

### 3. Backend Setup

```bash
cd DocumentOrganiser-Backend

# Create secrets file
cp src/main/resources/application-secrets.properties.example \
   src/main/resources/application-secrets.properties

# Edit with your credentials (PostgreSQL, JWT secret, Google OAuth2, MinIO keys)
nano src/main/resources/application-secrets.properties

# Run the backend
./gradlew bootRun
```

The backend starts at **http://localhost:8080/api**

- Swagger UI: http://localhost:8080/api/swagger-ui.html
- Health check: http://localhost:8080/actuator/health

### 4. Frontend Setup

```bash
cd DocumentOrganiser-Frontend/document-organiser-frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-at-least-32-characters-long
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
EOF

# Run development server
npm run dev
```

The frontend starts at **http://localhost:3000**

### 5. Full Docker Compose (Optional)

To run everything via Docker:

```bash
# From project root
docker compose up --build
```

Access the app at http://localhost:3000

---

## 📡 API Documentation

The backend exposes a comprehensive REST API documented via Swagger/OpenAPI.

### Core Endpoints

| Module | Endpoints | Description |
|:---|:---|:---|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google` | Registration, login, OAuth2 |
| **Documents** | `GET/POST/PUT/DELETE /api/documents/*` | CRUD, upload, download, preview, move, copy, favorite, tag |
| **Folders** | `GET/POST/PUT/DELETE /api/folders/*` | CRUD, nested hierarchy, move |
| **Search** | `GET /api/search` | Full-text search with filters |
| **Sharing** | `POST /api/shares/*` | User sharing, public link generation |
| **Trash** | `GET/POST/DELETE /api/trash/*` | List, restore, permanent delete, empty |
| **Dashboard** | `GET /api/dashboard/stats` | Stats, storage, recent activity |
| **Activity** | `GET /api/activity` | Paginated activity/audit log |
| **Notifications** | `GET/PUT /api/notifications/*` | User notifications |
| **User** | `GET/PUT /api/users/profile`, `PUT /api/users/settings` | Profile & settings |
| **Health** | `GET /actuator/health` | Service health check |

### Key Request/Response Patterns

All API responses follow a unified envelope:

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

## ☁️ Deployment

This project is designed for **AWS 3-Tier Architecture** deployment.

See the comprehensive **[AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md)** for step-by-step instructions covering:

1. AWS Secrets Manager setup
2. IAM roles & instance profiles
3. Backend AMI build (Spring Boot JAR)
4. Frontend AMI build (Next.js standalone)
5. Security groups (4-tier)
6. Target groups & ALB configuration
7. Launch templates & Auto Scaling Groups
8. Google OAuth console updates
9. End-to-end testing
10. Instance refresh (zero-downtime deployment)

---

## 📂 Project Structure

```
Full-Stack-Project-DocumentOrganiser/
├── README.md                           ← You are here
├── AWS-DEPLOYMENT-GUIDE.md             ← Production deployment guide
├── docker-compose.yml                  ← Local dev infrastructure
│
├── DocumentOrganiser-Backend/          ← Spring Boot API
│   ├── build.gradle.kts
│   ├── src/main/java/.../
│   │   ├── config/                     ← Security, CORS, JWT, S3, OpenAPI config
│   │   ├── controller/                 ← REST controllers (13 endpoints)
│   │   ├── dto/                        ← Request/Response DTOs
│   │   ├── entity/                     ← JPA entities (User, Document, Folder, etc.)
│   │   ├── exception/                  ← Custom exceptions + global handler
│   │   ├── mapper/                     ← MapStruct entity-DTO mappers
│   │   ├── repository/                 ← Spring Data JPA repositories
│   │   ├── security/                   ← JWT filter, UserPrincipal, OAuth2 handler
│   │   ├── service/                    ← Business logic interfaces + implementations
│   │   └── util/                       ← File type utilities
│   └── src/main/resources/
│       ├── application.properties      ← Common config
│       ├── application-dev.properties  ← Dev profile
│       ├── application-prod.properties ← Production profile
│       └── db/migration/               ← Flyway SQL migrations
│
└── DocumentOrganiser-Frontend/         ← Next.js UI
    └── document-organiser-frontend/
        ├── package.json
        ├── next.config.ts
        ├── src/
        │   ├── app/                    ← App Router pages (21 routes)
        │   │   ├── (auth)/login/       ← Login page
        │   │   ├── (dashboard)/        ← Dashboard layout + 14 sub-pages
        │   │   ├── share/[token]/      ← Public share view
        │   │   └── api/auth/           ← NextAuth API routes
        │   ├── components/
        │   │   ├── ui/                 ← shadcn/ui base components
        │   │   ├── layout/             ← Sidebar, Header, Breadcrumb
        │   │   └── features/           ← Feature components (files, folders, share, etc.)
        │   ├── lib/
        │   │   ├── api/                ← API service modules (11 modules)
        │   │   ├── hooks/              ← React Query hooks
        │   │   ├── store/              ← Zustand stores
        │   │   ├── types/              ← TypeScript type definitions
        │   │   └── utils/              ← Utility functions
        │   └── auth.ts                 ← NextAuth v5 configuration
        └── public/                     ← Static assets
```

---

## 🧪 Development

### Backend Tests

```bash
cd DocumentOrganiser-Backend
./gradlew test
```

### Frontend Lint & Type Check

```bash
cd DocumentOrganiser-Frontend/document-organiser-frontend
npm run lint
npx tsc --noEmit
```

### Frontend Build

```bash
npm run build
```

---

## 🔧 Configuration

### Backend Configuration Profiles

| Profile | File | Usage |
|:---|:---|:---|
| `default` | `application.properties` | Shared config (port, context path, Flyway, actuator) |
| `dev` | `application-dev.properties` | Local PostgreSQL, MinIO, Redis disabled, CORS localhost |
| `prod` | `application-prod.properties` | AWS RDS, S3, Redis, strict CORS, Hibernate validate mode |

### Key Configuration

| Setting | Default | Description |
|:---|:---|:---|
| Server Port | `8080` | Backend API port |
| Context Path | `/api` | API base path |
| Max Upload Size | `100MB` | Maximum file upload size |
| JWT Expiration | `24 hours` | Access token lifetime |
| JWT Refresh | `7 days` | Refresh token lifetime |
| Storage Quota | `1GB` | Per-user storage limit (prod) |
| Trash Retention | `30 days` | Auto-delete trashed items after this period |

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
