# 🛶 Vela Frontend

En gruppe-baseret madplansplatform hvor du swiper på opskrifter med din familie eller venner. Når alle i gruppen har liket den samme ret, er det et **match** – og retten kan tilføjes til madplanen!

---

## 🛠️ Tech Stack

| Lag         | Teknologi                  |
|-------------|---------------------------|
| **Frontend** | React 19 + Vite + TypeScript |
| **Styling**  | Tailwind CSS 4            |
| **State**    | Zustand                   |
| **Routing**  | React Router v7           |
| **HTTP**     | Axios                     |
| **Realtid**  | SignalR (`@microsoft/signalr`) |
| **Backend**  | ASP.NET Core (separat repo) |
| **Database** | PostgreSQL (separat repo) |

---

## ⚙️ Forudsætninger

Sørg for at have følgende installeret:

- **Node.js** v18+ → [nodejs.org](https://nodejs.org/) *(LTS anbefales)*
- **Git** → [git-scm.com](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone repository

```bash
git clone https://github.com/DTU-gruppe-7/Vela-frontend.git
cd Vela-frontend
```

### 2. Gå til frontend-mappen

```bash
cd frontend
```

> **Vigtigt:**
> Alle `npm`-kommandoer skal køres fra `frontend/`-mappen, ikke fra roden.

### 3. Installer afhængigheder

```bash
npm install
```

### 4. Start udviklingsserveren

```bash
npm run dev
```

Appen kører nu på **[http://localhost:5173](http://localhost:5173)** 🎉

---

## 📁 Projektstruktur

```
frontend/src/
├── api/           # Axios-klient + API-kald per domæne
├── components/
│   ├── layout/    # Header, Footer, MainLayout
│   └── ui/        # Delte UI-komponenter (Button, Card)
├── features/      # Feature-baseret organisering
│   ├── auth/      # Login & registrering
│   ├── swipe/     # Swipe-funktionalitet
│   ├── groups/    # Gruppe-administration
│   ├── mealplan/  # Madplan
│   ├── shopping/  # Indkøbsliste
│   └── profile/   # Brugerprofil
├── hooks/         # Delte custom hooks
├── navigation/    # AppRouter + ProtectedRoute
├── stores/        # Zustand stores
└── types/         # TypeScript interfaces
```

Se [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md) for den fulde guide.

---

## 📜 Tilgængelige scripts

| Kommando         | Beskrivelse            |
|------------------|------------------------|
| `npm run dev`    | Start lokal udviklingsserver |
| `npm run build`  | Byg til produktion    |
| `npm run preview`| Forhåndsvis produktionsbuild |
| `npm run lint`   | Kør ESLint            |

---

## ❓ Fejlfinding

- **`"Missing script: 'dev'"**
  → Du er ikke i `frontend/`-mappen. Kør `cd frontend` først.

- **Tailwind-klasser virker ikke**
  → Sørg for at `index.css` indeholder `@import "tailwindcss"` og at `vite.config.ts` har `tailwindcss()` som plugin.