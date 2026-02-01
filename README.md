# Faculty Feedback and Suggestion System
## Sistem Kritik dan Saran Fakultas

A secure, transparent, and documented platform for students, lecturers, and staff to voice their feedback and suggestions.

## Features

- **Multi-Actor System:** Supports 4 roles - End User, Faculty Admin, Related Units, and Faculty Leadership
- **Anonymous Submissions:** Users can submit feedback anonymously
- **Real-time Status Tracking:** Track feedback from Submitted → Processing → Completed
- **File Attachments:** Support for images and documents
- **Reporting Dashboard:** Statistical overview for leadership
- **Notifications:** Automatic alerts for status changes

## Tech Stack

- **Frontend:** React.js with Tailwind CSS
- **Backend:** Node.js with Express
- **Database:** PostgreSQL
- **ORM:** TypeORM with Migrations
- **Infrastructure:** Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development without Docker)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd faculty-feedback

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migration:run

# Run seeders
docker-compose exec backend npm run seed
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- PostgreSQL: localhost:5432

### Local Development (without Docker)

#### Backend

```bash
cd backend
npm install
cp .env.example .env

# Start PostgreSQL locally or update .env with your DB credentials

npm run migration:run
npm run seed
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
faculty-feedback/
├── backend/
│   ├── src/
│   │   ├── entities/        # TypeORM entities
│   │   ├── migrations/      # Database migrations
│   │   ├── seeders/         # Database seeders
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── uploads/             # File uploads
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── hooks/           # Custom hooks
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Feedback/Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report (supports anonymous)
- `GET /api/reports/:id` - Get report details
- `PATCH /api/reports/:id/status` - Update report status

### Categories
- `GET /api/categories` - List categories

### Dashboard
- `GET /api/dashboard/stats` - Get statistics

## Default Accounts (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@faculty.edu | admin123 |
| User | user@faculty.edu | user123 |
| Unit | unit@faculty.edu | unit123 |
| Leadership | leader@faculty.edu | leader123 |

## License

MIT License
