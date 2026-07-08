# InterviewIQ — AI Mock Interview Platform

A full-stack mock interview simulator that generates role-specific interview questions,
evaluates your answers with AI, and gives you a scored performance report — so you can
practice before the real thing.

Built with **Spring Boot** (Java), **React + TypeScript**, and **Google Gemini AI**.

---

## Project Status

This project is being built incrementally and documented step by step.

- [x] Project scaffold & architecture
- [x] Database entities (User, Interview, Question, Answer)
- [x] JWT authentication (register/login)
- [x] AI service integration (Gemini — question generation & answer evaluation)
- [x] Interview flow API (start → answer → complete → report)
- [ ] React frontend (in progress)
- [ ] Voice input (Web Speech API)
- [ ] Coding round editor (Monaco)
- [ ] Deployment

---

## Features

- **AI-generated questions** tailored to a chosen job role, tech stack, and difficulty
  — mixing behavioral, technical, and coding questions in one session.
- **Real-time AI evaluation** of each answer: a 0–10 score, specific feedback, and a
  concrete improvement tip.
- **Full mock interview flow**: text or voice answers, plus a coding round with a
  real code editor.
- **Performance report** at the end: overall score, category breakdowns
  (behavioral / technical / coding), and per-question feedback.
- **Secure auth**: JWT-based login, passwords hashed with BCrypt.
- **Interview history**: past sessions saved per user.

---

## Tech Stack

**Backend**
- Java 17, Spring Boot 3
- Spring Security + JWT (`jjwt`)
- Spring Data JPA (H2 in-memory by default, Postgres-ready)
- Google Gemini API for question generation & grading (free tier)

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- Recharts (score visualizations)
- Monaco Editor (coding round)
- Web Speech API (voice answers)

---

## Architecture

This is a **modular monolith**, not microservices: one deployable Spring Boot app,
internally organized into clean, independent modules (`auth`, `interview`, `ai`) by
package. This keeps the codebase simple to run and reason about, while still
demonstrating clear separation of concerns — the modules could be split into real
services later if the app ever needed to scale that way.

```
backend/
└── src/main/java/com/aiinterview/
    ├── config/        → security & CORS setup
    ├── controller/     → REST API endpoints
    ├── dto/             → request/response data shapes
    ├── entity/          → database models
    ├── repository/     → data access (Spring Data JPA)
    ├── security/        → JWT auth
    ├── service/         → business logic + AI integration
    └── exception/      → centralized error handling

frontend/
└── src/                → React + TypeScript app
```

---

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- A free Gemini API key: https://aistudio.google.com/app/apikey

### 1. Backend setup

```bash
cd backend

# Set your Gemini API key (required for AI features)
export GEMINI_API_KEY=your_key_here      # macOS/Linux
setx GEMINI_API_KEY "your_key_here"       # Windows (restart terminal after)

mvn spring-boot:run
```

The backend starts on **http://localhost:8080**, using an in-memory H2 database
(no DB installation needed to try it out). Swap to Postgres by editing
`src/main/resources/application.yml`.

### 2. Frontend setup

```bash
cd frontend
cp .env.example .env    # then edit if your backend runs elsewhere
npm install
npm run dev
```

The frontend starts on **http://localhost:5173**.

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `GEMINI_API_KEY` | backend | Your free Google Gemini API key |
| `JWT_SECRET` | backend | Secret used to sign JWTs (defaults to a dev value — change in production) |
| `FRONTEND_URL` | backend | Allowed CORS origin, defaults to `http://localhost:5173` |
| `VITE_API_BASE_URL` | frontend | Backend API base URL, defaults to `http://localhost:8080/api` |

---

## Screenshots

_Coming soon — will be added once the frontend is built._

---

## License

MIT
