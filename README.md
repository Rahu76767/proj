# CyberaTech Backend — Setup Guide

## What This Does
- Receives contact form submissions from your website
- Stores them in a local **SQLite database** (`leads.db`)  
- Provides an **admin panel** to view, search, filter, and export leads as CSV

---

## Project Structure
```
backend/
├── server.js          ← Node.js + Express API
├── package.json       ← Dependencies
├── leads.db           ← Auto-created SQLite database (after first run)
└── public/
    ├── index.html     ← Your main website (updated to post to API)
    ├── porti2.html    ← Your pricing page
    └── admin.html     ← Admin panel for viewing leads
```

---

## Setup (One-Time)

### 1. Install Node.js
Download from https://nodejs.org (v18 or higher recommended)

### 2. Install dependencies
Open a terminal in the `backend/` folder and run:
```bash
npm install
```

### 3. Start the server
```bash
npm start
```
You'll see:
```
✅ Database ready → leads.db
🚀 CyberaTech backend running at http://localhost:3000
   Admin panel → http://localhost:3000/admin.html
```

---

## Usage

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Your main website |
| `http://localhost:3000/porti2.html` | Pricing page |
| `http://localhost:3000/admin.html` | Admin lead viewer |

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/contact` | Save a form submission |
| GET | `/api/leads` | Get all leads (JSON) |
| DELETE | `/api/leads/:id` | Delete a lead by ID |

---

## Deploying to a Live Server (Optional)

If you want this on a real server (e.g., Ubuntu VPS):

```bash
# Install PM2 to keep the server running
npm install -g pm2
pm2 start server.js --name cyberatech
pm2 startup   # auto-start on reboot
pm2 save
```

Then set up **Nginx** to reverse proxy port 3000:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

---

## Notes
- `leads.db` is created automatically — no setup needed
- All data is stored locally on your server (no third-party services)
- The admin panel at `/admin.html` should be **password-protected** in production  
  (add basic auth in Nginx, or ask me to add a login page)
