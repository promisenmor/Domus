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
- **Database**: SQLite (for development)  
- **Auth**: Custom User Model, JWT  
- **Admin Panel**: Custom, unified interface using Django Tailwind  
- **Rich Text**: CKEditor 5 for blog/pages  
- **Tasks**: Celery + Redis (optional)  
- **Containerization**: Docker-ready (in progress)  
- **Deployment Target**: Heroku / AWS / VPS

---

## 📁 Project Structure

