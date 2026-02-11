# Document Organiser - Spring Boot Backend

A comprehensive document management system with Google OAuth authentication, allowing users to store, organize, and manage documents with folder/file structure.

## 🚀 Technology Stack

- **Framework**: Spring Boot 3.4.x
- **Language**: Java 21
- **Database**: PostgreSQL
- **File Storage**: AWS S3 / MinIO
- **Authentication**: Spring Security + OAuth2 (Google) + JWT
- **API Documentation**: Swagger/OpenAPI
- **Build Tool**: Gradle (Kotlin DSL)
- **Caching**: Redis

## 📁 Project Structure

```
src/main/java/com/alphadocuments/documentorganiserbackend/
├── config/           # Configuration classes
├── controller/       # REST API controllers
│   └── advice/       # Global exception handlers
├── dto/              # Data Transfer Objects
│   ├── request/      # Request DTOs
│   └── response/     # Response DTOs
├── entity/           # JPA entities
│   └── enums/        # Enumerations
├── exception/        # Custom exceptions
├── mapper/           # MapStruct mappers
├── repository/       # JPA repositories
├── security/         # Security configuration
│   ├── jwt/          # JWT components
│   └── oauth2/       # OAuth2 components
├── service/          # Service interfaces
│   └── impl/         # Service implementations
└── util/             # Utility classes
```

## 🛠️ Prerequisites

- Java 21+
- Docker & Docker Compose
- PostgreSQL 16+
- MinIO or AWS S3 account
- Google OAuth2 credentials

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd DocumentOrganiser-Backend
```

### 2. Start infrastructure services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- MinIO (ports 9000, 9001)
- Redis (port 6379)

### 3. Configure Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth2 credentials
5. Add authorized redirect URI: `http://localhost:8080/api/oauth2/callback/google`

### 4. Update application-dev.properties

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

### 5. Run the application

```bash
./gradlew bootRun
```

The API will be available at: `http://localhost:8080/api`

## 📚 API Documentation

Once running, access Swagger UI at:
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/api-docs

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/google` | Authenticate with Google |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile` | Update profile |
| PUT | `/users/settings` | Update settings |
| DELETE | `/users/account` | Delete account |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/folders` | Create folder |
| GET | `/folders/{id}` | Get folder |
| PUT | `/folders/{id}` | Update folder |
| DELETE | `/folders/{id}` | Delete folder |
| GET | `/folders/tree` | Get folder tree |
| POST | `/folders/{id}/move` | Move folder |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents` | Upload document |
| GET | `/documents/{id}` | Get document |
| GET | `/documents/{id}/download` | Download document |
| PUT | `/documents/{id}` | Rename document |
| DELETE | `/documents/{id}` | Delete document |
| POST | `/documents/{id}/move` | Move document |
| POST | `/documents/{id}/copy` | Copy document |
| POST | `/documents/{id}/favorite` | Toggle favorite |
| GET | `/documents/recent` | Get recent documents |
| GET | `/documents/favorites` | Get favorites |
| GET | `/documents/category/{category}` | Get by category |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search` | Search documents & folders |
| GET | `/search/documents` | Search documents |
| GET | `/search/folders` | Search folders |

### Sharing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/{id}/share` | Share with user |
| POST | `/documents/{id}/share/link` | Create share link |
| GET | `/documents/shared-with-me` | Get shared with me |
| GET | `/documents/shared-by-me` | Get shared by me |

### Trash
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trash` | Get trash items |
| POST | `/trash/{id}/restore` | Restore item |
| DELETE | `/trash/{id}` | Permanently delete |
| DELETE | `/trash/empty` | Empty trash |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard stats |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get notifications |
| GET | `/notifications/unread/count` | Get unread count |
| PUT | `/notifications/{id}/read` | Mark as read |
| PUT | `/notifications/read-all` | Mark all as read |

### Activity
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activity` | Get activity log |

## 🐳 Docker Deployment

### Build Docker image

```bash
docker build -t document-organiser-backend .
```

### Run with Docker Compose

```bash
docker-compose -f compose.yaml up -d
```

## 🧪 Testing

```bash
# Run all tests
./gradlew test

# Run with coverage
./gradlew test jacocoTestReport
```

## 📊 Database Migrations

Flyway is used for database migrations. Migration files are located in:
`src/main/resources/db/migration/`

## 🔒 Security Features

- Google OAuth2 authentication
- JWT-based session management
- Refresh token rotation
- Rate limiting ready
- CORS configuration
- Password-protected share links
- Role-based access control

## 📄 License

MIT License
