# SkillConnect – Community-Based Essential Worker Service Platform

SkillConnect is a web-based platform that connects customers with nearby essential service workers. It helps people find local professionals, request services, manage bookings, and review completed work.

The platform supports three roles: **Customer**, **Worker**, and **Administrator**.

## Features

### Customer
- Register and log in.
- Search for workers by service category and location.
- View worker profiles and service information.
- Submit service booking requests.
- Track bookings and review worker-submitted estimates.
- Approve or reject estimates.
- Rate and review workers after completed services.

### Worker
- Register and create a professional profile.
- Add service category, experience, and rate information.
- Submit verification documents for administrator review.
- Manage availability and booking requests.
- Accept or reject service requests.
- Submit itemised estimates for customer approval.
- Update the progress of assigned jobs.

### Administrator
- Manage customer and worker accounts.
- Review worker registration and verification documents.
- Approve or reject worker verification.
- Monitor bookings and platform activity.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, Bootstrap 5, Axios |
| Backend | Python 3.12, Django 5, Django REST Framework |
| Database | SQLite |
| Authentication | JSON Web Token (JWT) |
| Development tools | Visual Studio Code, Git, GitHub, Postman |

## Project Structure

```text
SkillConnect/
├── skillconnect-app/       # React frontend
├── skillconnect-backend/   # Django backend
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.12
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/kiranp999/SkillConnect.git
cd SkillConnect
```

### 2. Set up the backend

```bash
cd skillconnect-backend
python -m venv .venv
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

If the backend contains a `requirements.txt` file, install its dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py migrate
```

Create an administrator account if required:

```bash
python manage.py createsuperuser
```

Run the backend:

```bash
python manage.py runserver
```

The Django development server is usually available at `http://127.0.0.1:8000/`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd skillconnect-app
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal (commonly `http://localhost:5173/`).

## How It Works

1. A customer registers and logs in.
2. The customer searches for a worker by service category or location.
3. The customer submits a booking request with the required service details.
4. The worker reviews the request and responds.
5. The worker submits an estimate for the requested work.
6. The customer reviews and approves or rejects the estimate.
7. The worker updates the job status as the service progresses.
8. After completion, the customer can submit a rating and review.

## Authentication and Access

SkillConnect uses JWT-based authentication for API access. Role-based access separates customer, worker, and administrator functions.

## Database

The project uses SQLite for development data, including user accounts, worker profiles, service categories, bookings, estimates, and reviews.

## Future Enhancements

- Online payment gateway integration.
- GPS-based worker discovery and map navigation.
- Dedicated Android and iOS applications.
- Multilingual support for local users.
- Smarter worker recommendations.
- Migration to PostgreSQL for larger-scale deployment.

## Security Notes

- Do not commit `.env` files, passwords, Django secret keys, access tokens, or other credentials.
- Keep production secrets outside the source code.
- Do not upload a database containing real users' personal information.
- Configure production security settings before deployment.

## Project Status

This repository contains the SkillConnect project source code. The instructions above are for local development; deployment may require additional configuration.

## Author

**Kiran P**

## License

No license has been specified for this repository. All rights are reserved by the project owner unless a license is added.
