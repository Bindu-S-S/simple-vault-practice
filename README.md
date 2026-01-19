# SimpleVault - File Hosting System with Deduplication

A full-stack file hosting application featuring content-based deduplication using SHA-256 hashing.

## Features

- **File Upload**: Upload any file type
- **Content-Based Deduplication**: Automatically detects duplicate files using SHA-256 hashing
- **File Management**: View all uploaded files with metadata
- **Duplicate Tracking**: Visual indicators for original vs duplicate files
- **Storage Optimization**: Duplicates reference original files instead of storing copies

## Tech Stack

- **Backend**: Django REST Framework (Python 3.12)
- **Frontend**: React.js
- **Database**: SQLite
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Docker Desktop installed and running

### Run the Application
```bash
# Navigate to project directory
cd simple-vault-practice

# Start the application
docker compose up --build
```

Wait 2-3 minutes for containers to build and start.

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/files/

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/files/ | List all files |
| POST | /api/files/ | Upload a file |
| GET | /api/files/{id}/ | Get file details |
| DELETE | /api/files/{id}/ | Delete a file |

## Deduplication Algorithm

1. Calculate SHA-256 hash of uploaded file content
2. Check database for existing file with same hash
3. If match found → Create reference to original (no duplicate storage)
4. If no match → Store file and save hash

## Project Structure
```
simple-vault-practice/
├── backend/
│   ├── files/              # Django app
│   │   ├── models.py       # File model with hash field
│   │   ├── views.py        # API logic with deduplication
│   │   ├── serializers.py  # REST serializers
│   │   └── urls.py         # API routes
│   ├── vault_backend/      # Django settings
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main component
│   │   ├── FileUpload.js   # Upload component
│   │   └── FileList.js     # File listing component
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Stopping the Application
```bash
# Stop containers
docker compose down

# Stop and remove volumes (clear data)
docker compose down -v
```
```

**Save** (Ctrl + S)

---

## Step 2: Verify Final Structure

Your project should look like this:
```
simple-vault-practice/
├── backend/
│   ├── files/
│   ├── vault_backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
├── docker-compose.yml
└── README.md          ← NEW