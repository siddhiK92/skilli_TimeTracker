# 🏢 TeamPulse — Internal Team Dashboard

A full-stack MERN application for internal team attendance tracking, status management, and EOD (End of Day) reporting.

---

## 🚀 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, React Router v6   |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT (JSON Web Tokens) + bcryptjs  |
| Styling   | CSS Modules + Poppins font        |

---

## 📁 Project Structure

```
teampulse/
├── package.json                  ← Root: concurrently scripts
│
├── server/                       ← Express API
│   ├── index.js                  ← Entry point
│   ├── .env                      ← Environment variables
│   ├── models/
│   │   ├── User.js               ← User schema (auth + attendance)
│   │   └── EOD.js                ← EOD report schema
│   ├── controllers/
│   │   ├── authController.js     ← Login / Logout / Register / Me
│   │   ├── userController.js     ← Get all users, update status
│   │   └── eodController.js      ← Submit & fetch EOD reports
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── eod.js
│   └── middleware/
│       └── auth.js               ← JWT protect middleware
│
└── client/                       ← React (Vite)
    ├── index.html
    ├── vite.config.js            ← Proxy /api → localhost:5000
    └── src/
        ├── main.jsx
        ├── App.jsx               ← Routes + Providers
        ├── index.css             ← Global design system
        ├── context/
        │   ├── AuthContext.jsx   ← Global auth state
        │   └── ToastContext.jsx  ← Global toast notifications
        ├── utils/
        │   ├── api.js            ← Axios instance + interceptors
        │   └── helpers.js        ← formatTime, calcHours, etc.
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── Dashboard.jsx     ← Main dashboard page
        └── components/
            ├── Header.jsx        ← Sticky nav with Punch Out
            ├── StatsRow.jsx      ← 4 stat cards
            ├── TeamTable.jsx     ← Full team attendance table
            ├── EODModal.jsx      ← Submit EOD form
            └── EODViewModal.jsx  ← View EOD history
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on port 27017
  - Install: https://www.mongodb.com/try/download/community
  - Or use MongoDB Atlas (update `MONGO_URI` in `server/.env`)

---

## 🛠️ Setup & Installation

### 1. Clone / extract the project

```bash
cd teampulse
```

### 2. Install all dependencies (root + server + client)

```bash
npm run install:all
```

Or manually:

```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Configure environment variables

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/teampulse
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

> ⚠️ Change `JWT_SECRET` to a long random string in production.

### 4. Start the development servers

```bash
# From root directory — starts both server + client
npm run dev
```

- **API Server:** http://localhost:5000
- **React App:**  http://localhost:5173

---

## 📡 API Endpoints

### Auth
| Method | Endpoint             | Description              | Auth |
|--------|----------------------|--------------------------|------|
| POST   | `/api/auth/register` | Register new user        | ❌   |
| POST   | `/api/auth/login`    | Login + Punch In         | ❌   |
| POST   | `/api/auth/logout`   | Logout + Punch Out       | ✅   |
| GET    | `/api/auth/me`       | Get current user         | ✅   |

### Users
| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| GET    | `/api/users`          | Get all team members     | ✅   |
| PATCH  | `/api/users/status`   | Update own status        | ✅   |

### EOD Reports
| Method | Endpoint                    | Description                    | Auth |
|--------|-----------------------------|--------------------------------|------|
| POST   | `/api/eod`                  | Submit/update today's EOD      | ✅   |
| GET    | `/api/eod/my`               | My EOD history                 | ✅   |
| GET    | `/api/eod/today`            | All EODs submitted today       | ✅   |
| GET    | `/api/eod/user/:userId`     | Specific user's EOD history    | ✅   |

---

## 🎨 Design System

```
Primary Blue:   #1F3A63  ← Header, buttons
Secondary Blue: #3E5C76  ← Cards, secondary elements
Background:     #F7F9FC  ← Page background
Accent:         #7367F0  ← Highlights, hover states

Online:         #28C76F  ← Green status
Offline:        #EA5455  ← Red status
On Leave:       #FF9F43  ← Orange status

Font: Poppins (Google Fonts)
```

---

## ✨ Features

- 🔐 **JWT Authentication** — secure login/logout with token persistence
- ⏱️ **Punch In / Punch Out** — login = punch in, logout = punch out
- 🟢 **Live Status Tracking** — Online / Offline / On Leave per user
- ⏳ **Working Hours** — auto-calculated from login → logout (or current time)
- 📝 **EOD Reports** — submit projects, completed tasks, planned tasks per day
- 📄 **EOD History** — view any team member's past EOD reports
- 📊 **Stats Dashboard** — total / online / offline / on leave counts
- 🍞 **Toast Notifications** — global success/error/warning feedback

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens expire in **12 hours**
- Protected routes use `Authorization: Bearer <token>` header
- Axios interceptor auto-attaches token to every request
- 401 responses auto-redirect to `/login`

---

## 🚢 Production Build

```bash
# Build React frontend
cd client && npm run build

# Serve static files from Express (add to server/index.js):
# app.use(express.static(path.join(__dirname, '../client/dist')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));

# Start production server
cd server && npm start
```

---

## 🔮 Future Enhancements

- [ ] Real-time updates with Socket.io
- [ ] Admin panel to manage users
- [ ] Weekly / monthly working hours reports
- [ ] Leave request approval workflow
- [ ] Email notifications for EOD reminders
- [ ] Export attendance data to CSV/Excel
- [ ] Dark mode toggle
