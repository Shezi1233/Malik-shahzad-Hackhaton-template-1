---
name: shopco-project-setup
description: SHOP.CO e-commerce full-stack project structure and configuration
metadata:
  type: project
  type: reference
---

# SHOP.CO Project

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** FastAPI (Python) + SQLAlchemy ORM
- **Database:** PostgreSQL (Neon) — connection via `DATABASE_URL` in `backend/.env`
- **Vector DB:** Qdrant Cloud — `QDRANT_URL` + `QDRANT_API_KEY` in `backend/.env`
- **AI:** Google Gemini (`gemini-1.5-flash`) for embeddings + generation
- **Auth:** Custom JWT (bcrypt + PyJWT), token in localStorage
- **Fallback LLM:** OpenRouter (`OPENROUTER_API_KEY` in `backend/.env`)
- **Images:** Stored in `/public/` directory on frontend

## Chatbot (Fully RAG)
- Intent detection for common queries (greeting, help, orders, discounts)
- RAG pipeline: query → Gemini embedding → Qdrant vector search → Gemini generation
- Fallbacks: OpenRouter → SQL keyword search → show all products
- `/api/chatbot/status` endpoint to check service health
- `/api/chatbot/reindex` to rebuild vector index

## Key Env Files
- `backend/.env` — Database, AI, Vector DB credentials
- `.env.local` — Frontend API URL, Sanity config

## Setup Commands
- Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
- Frontend: `npm run dev`
