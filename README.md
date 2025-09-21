# Organ Transplant System 🫀

Clean, modern demo platform for AI‑assisted organ donor ↔ recipient matching, outcome logging, and transplant workflow exploration.

<p align="left">
  <img alt="FastAPI" src="https://img.shields.io/badge/API-FastAPI-05998b?logo=fastapi&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/Frontend-React-149eca?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/Language-TypeScript-3178c6?logo=typescript&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/UI-Tailwind-38bdf8?logo=tailwindcss&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/AI-Gemini-4285f4?logo=google&logoColor=white" />
  <img alt="DB" src="https://img.shields.io/badge/DB-SQLite-044a64?logo=sqlite&logoColor=white" />
</p>

## ✨ Highlights
| Capability | Description |
|------------|-------------|
| Donor / Recipient CRUD | Manage structured clinical entities |
| AI Matching | Gemini-generated match score + reason per candidate |
| Top 3 Rankings | Returns best three matches with enriched recipient details |
| Threshold Allocation | Only allocates above configurable score (default 70) |
| Pending Logging | Below-threshold best attempt still logged for visibility |
| Dashboard | Live stats + recent matches feed |
| Dark Mode | Seamless theme toggle built on Tailwind |
| Extensible | Transport & advanced logistics scaffolding present |

## 🚀 Quick Start
```powershell
# Backend
cd backend
python -m venv .venv
./.venv/Scripts/Activate.ps1
pip install -r requirements.txt
echo GOOGLE_API_KEY=your_gemini_key > .env
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm start
```
Visit: http://localhost:3000  |  API root: http://127.0.0.1:8000/docs

## 🧬 Matching Flow
1. Call `POST /match/ai-match/{donor_id}`
2. Each waiting recipient scored via Gemini prompt
3. Candidates collected → sorted → top 3 returned
4. If best ≥ 70 → allocation committed (status changes + log)
5. If best < 70 → top candidate logged (pending) without status changes
6. Response includes: `donor`, `recipient` (or null), `ai_match`, `top_matches`

## 📊 Dashboard Data
Endpoint | Purpose
---------|--------
`GET /dashboard/stats` | Aggregate counts (pending vs successful ≥80)
`GET /dashboard/recent-matches` | Reverse-chronological allocation logs

Frontend normalizes each log to: `{ id, donor, recipient, score, time }`.

## 🗂 Structure
```
backend/app/
  main.py        # FastAPI app + routers
  models.py      # SQLAlchemy models
  routes/        # donors, recipients, match, Dashboard, etc.
  utils/         # Future deterministic helpers
frontend/src/
  pages/         # Dashboard, Matchdonor, Management pages
  components/    # Reusable UI atoms
  contexts/      # Theme context
  services/      # API helper
```

## 🔐 Environment (.env in backend/)
```
GOOGLE_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./transplant.db   # optional override
```

## 🌱 Seed Sample Data
```powershell
# Donor
Invoke-RestMethod -Method POST -ContentType 'application/json' `
  -Body '{"name":"Donor A","blood_type":"O+","organ":"Kidney","age":34,"location":"City A"}' `
  http://127.0.0.1:8000/donors/

# Recipient
Invoke-RestMethod -Method POST -ContentType 'application/json' `
  -Body '{"name":"Recipient X","blood_type":"O+","organ_needed":"Kidney","urgency_level":2,"location":"City B"}' `
  http://127.0.0.1:8000/recipients/
```

## 🧪 Trigger a Match
```powershell
Invoke-RestMethod -Method POST http://127.0.0.1:8000/match/ai-match/1
```
If below threshold: recipient=null, but pending log appears in Dashboard.

## 🔍 Sample Response (trimmed)
```json
{
  "donor": "Donor A",
  "recipient": "Recipient X",
  "ai_match": { "match_score": 85, "reason": "Compatible blood type" },
  "top_matches": [ { "recipient_id": 3, "match_score": 85, "reason": "..." } ]
}
```

## 🛠 Notable Implementation Choices
- Dual Gemini init (`configure` + `set_api_key`) for library version resilience
- Pending log cooldown prevents spam (5 min)
- Frontend defensive normalization of API payloads
- Separation of scoring (AI) vs. persistence (threshold gating)

## 🧭 Roadmap Ideas
- WebSockets / SSE for real-time updates
- ABO + HLA style deterministic pre-filter before AI
- AllocationLog explicit status column (pending/allocated)
- Test suite (pytest + Playwright)
- Role-based auth & audit events
- Transport routing with ETA optimization

## 🩺 Troubleshooting
Issue | Fix
------|-----
No dashboard data | Ensure `/dashboard` router loaded & trigger a match
All scores 0 | Check `GOOGLE_API_KEY` present
Duplicate pending logs | Respect 5‑minute cooldown or increase threshold
CORS errors | Add frontend origin in CORS settings in `main.py`

## 📄 License
Educational / demo purpose. Add a formal license before production use.

---
Crafted to explore how AI can augment allocation workflows. Contributions & enhancements welcome.