# 🧠 Cognara – A Moderated Blogging Platform

**Cognara** is a full-stack blog platform that enables open article submissions with administrative moderation. Built with a modern tech stack, it provides a seamless user experience, robust admin workflow, SEO optimization, and automated email notifications for subscribers.

## 🚀 Features

- 📝 **Open Article Submission**  
  Anyone can submit articles via the frontend interface.

- 🔒 **Admin Moderation Dashboard**  
  Articles remain unpublished until approved by an administrator.

- 🌍 **SEO-Friendly URLs and Metadata**  
  Clean URL routing and metadata support for better discoverability.

- 📤 **Newsletter Integration**  
  Users can subscribe with their email to receive summaries and links to newly published articles.

- 🔗 **Shareable Content**  
  Every published article can be easily shared across platforms.

## 💪 Tech Stack

### Frontend
- **React.js** – SPA architecture
- **React Router** – Routing
- **Tailwind CSS** – Utility-first styling
- **Axios** – API communication

### Backend
- **Django** – Core web framework
- **Django REST Framework** – RESTful API creation
- **PostgreSQL / SQLite** – Database (configurable)
- **Django SMTP** – Email notifications

## 📂 Project Structure

```
cognara/
├── backend/            # Django project
│   ├── blog/           # Article models, views, serializers
│   └── cognara/        # Settings and URL configuration
└── frontend/           # React application
    ├── src/
    │   ├── components/ # Shared UI components
    │   ├── pages/      # Page-level views (Home, Submit, Admin)
    │   └── App.jsx     # Routing and layout
```

## 📬 Newsletter Workflow

- Subscribed emails are stored in the database.
- When an admin approves an article, all subscribers receive a summary and a link to the full content.

## ✅ Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📄 License

MIT License. See `LICENSE` for details.
