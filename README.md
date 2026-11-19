# Domus 🏠  
A scalable real estate web application built with Django, designed to manage over 1 million property listings, synced from a CRM, while supporting manual listing control, multilingual support, SEO optimization, and a clean admin interface.

---

## 🚀 Features

- 🔐 **User Roles**: Clients, Agents, Staff, and Admins with role-based permissions.
- 🧾 **Listings**: Add/edit/manage property listings both via CRM sync and manually.
- 🖼 **Media Handling**: Image and file uploads supported via Django Media.
- ✍️ **CMS Features**: Manage blog, pages, menus from a unified admin.
- 🌍 **Multilingual Support**: Built-in internationalization ready for multiple languages.
- ⚙️ **User Dashboards**: Role-specific dashboard views (e.g., agents can manage listings).
- ❤️ **Saved Listings**: Authenticated users can save their favorite properties.
- 📩 **Contact Agents**: Public users can message agents via API.
- 🔍 **Advanced Search**: Filter and search properties by location, price, etc.
- 🔐 **JWT Authentication**: Secure authentication for API and frontend integration.
- 📈 **SEO Optimized**: Slugified URLs, meta support, sitemap, and robots.txt included.
- 🔄 **CRM Integration (Planned)**: Pull listings directly from an external CRM (via Celery).

---

## 🛠 Tech Stack

- **Backend**: Django, Django REST Framework  
- **Database**: postgres 
- **Auth**: Custom User Model, JWT  
- **Admin Panel**: Custom, unified interface using Django Tailwind  
- **Rich Text**: CKEditor 5 for blog/pages  
- **Tasks**: Celery + Redis (optional)  
- **Containerization**: Docker Compose with Django and PostgreSQL
- **Deployment Target**: Heroku / AWS / VPS

## 🚀 Getting Started

### Docker

Copy `.env.example` to `.env`, set a unique `DJANGO_SECRET_KEY` and database password, then start the application:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

The web container applies database migrations on startup. The API and Celery worker run alongside PostgreSQL and Redis. The API will be available at `http://localhost:8000/`.

### API documentation

- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI schema: `http://localhost:8000/api/schema/`

The schema documents the existing listing, account, content, and JWT endpoints.

The authentication API provides:

- `POST /api/register/` with `full_name`, `email`, and `password` (creates an unverified client account and queues a welcome email containing a verification link).
- `POST /api/auth/email/verify/` with the verification `token` from the welcome email.
- `POST /api/auth/email/verification/resend/` with `email` to resend an expired/missing verification email.
- `POST /api/auth/login/` with `email` and `password` (returns JWT access and refresh tokens).
- `POST /api/auth/logout/` with the authenticated user's `refresh` token (blacklists that refresh token).
- `POST /api/token/refresh/` with a refresh token to rotate tokens.
- `POST /api/auth/password/change/` with `current_password` and `new_password`.
- `POST /api/auth/password/forgot/` with `email`.
- `POST /api/auth/password/reset/` with `uid`, `token`, and `new_password`.
- `GET/PATCH /api/me/` for the authenticated profile.

Welcome and password-reset emails are queued through Celery. The default development email backend prints messages in worker logs; configure `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, and `EMAIL_USE_TLS` in `.env` for SMTP. Set `FRONTEND_BASE_URL` to the frontend origin to create password-reset links.
New accounts must verify their email before login; verification links expire after 24 hours by default. Existing accounts remain verified during migration. Email changes are read-only on `/api/me/` until a verification flow for changing addresses is added.
Logout invalidates the refresh token; an already-issued access token remains valid until its short expiry.

The initial listings API includes public published-property search and detail endpoints. Agent listing writes are restricted to agents and new agent listings remain unpublished until staff review.

### Local development

Install dependencies from the repository root with `pip install -r requirements.txt`, then run:

```powershell
python manage.py migrate
python manage.py runserver
```

SQLite is used locally unless `DB_HOST` is set; Docker Compose configures PostgreSQL.

---

## 📁 Project Structure
domus/
├── account/ # Custom user model and auth
├── listing/ # Core property listing logic
├── core/ # Pages, menus, blog, global utilities
├── media/ # Uploaded media files
├── static/ # Static files (CSS/JS)
└── domus/ # Project settings & URLs

## 🧑‍💻 Contributing
Fork the repo

Create a feature branch: git checkout -b feature/YourFeature

Commit your changes: git commit -m 'Add something'

Push to the branch: git push origin feature/YourFeature

Open a Pull Request


## 👨‍💼 Author
Promise Nmor
Backend Developer | Django | Python

