# 🚨 EmergencySathi

A crisis management web app built with React that connects 
citizens, coordinators, and agencies during emergencies in 
real time.

---

## 🚀 Features

- 🆘 **SOS Button** — One tap emergency alert system
- 📍 **Crisis Map** — Live incident mapping with location tracking
- 📋 **Incident Reporting** — Report emergencies with full details
- 👥 **Multi-role Dashboard** — Separate views for:
  - 👤 Citizens — Report and track nearby incidents
  - 🧑‍💼 Coordinators — Manage and assign emergency responses
  - 🏢 Agencies — Overview of all active crisis situations
- 🔐 **Authentication** — Secure login and signup system
- 📊 **Stats Dashboard** — Real time crisis statistics
- 🗺️ **Interactive Map** — Visual overview of crisis zones

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| React | Frontend framework |
| TypeScript | Type safety |
| Vite | Fast build tool |
| Tailwind CSS | Styling |
| shadcn-ui | UI Components |
| MapTiler | Interactive maps |

---

## 👤 User Roles

### 🙋 Citizen
- Report incidents in their area
- Send SOS alerts
- View nearby crisis events on map

### 🧑‍💼 Coordinator
- Receive and manage incident reports
- Assign tasks to agencies
- Monitor response status

### 🏢 Agency
- View assigned emergencies
- Update response status
- Coordinate field operations

---

## 📦 Installation

**Step 1 — Clone the repository**
```
git clone https://github.com/vedank26/Emergencysathi.git
```

**Step 2 — Navigate to project folder**
```
cd Emergencysathi
```

**Step 3 — Install dependencies**
```
npm install
```

**Step 5 — Run the app**
```
npm run dev
```

**Step 6 — Open in browser**
```
http://localhost:5173
```

---

## 📁 Project Structure
```
Emergencysathi/
│
├── src/
│   ├── components/
│   │   ├── landing/      ← Landing page sections
│   │   ├── shared/       ← Shared components
│   │   └── ui/           ← shadcn UI components
│   │
│   ├── context/          ← Auth and Coordinator context
│   ├── data/             ← Mock data
│   ├── hooks/            ← Custom hooks
│   ├── pages/            ← All page components
│   ├── types/            ← TypeScript types
│   └── lib/              ← Utility functions
│
├── public/
├── .gitignore
├── index.html
├── package.json
└── vite.config.ts
```

---

## 🌐 Live Demo

Coming soon...

---

## 📄 License

This project is for educational purposes.
