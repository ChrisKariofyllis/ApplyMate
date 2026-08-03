# ApplyMate

> Your personal AI career assistant. Analyze job postings, match them against your real experience, and generate tailored resumes — without making things up.

⚠️ **Early stage / MVP.** This is a work in progress. Feedback and contributions welcome once the repo goes public.

## The Problem

Applying for jobs takes time. Most people use the same CV for every application, even when a few targeted tweaks could make a real difference. But tailoring your resume for every posting is tedious — especially when you're already working full-time.

Most existing tools either:
- Overpromise on match accuracy
- Silently invent skills and experience you don't have
- Force you to trust a third-party platform with your entire career history

## What ApplyMate Does

1. **You build your career profile once** — skills, experience, education, languages, achievements.
2. **Paste a job link or description** — the AI analyzes the posting and extracts structured requirements.
3. **Get a realistic match report** — strengths, gaps, and a score based only on facts you've confirmed.
4. **Answer 2–3 targeted questions** — the AI only asks when information is genuinely missing.
5. **Receive a tailored CV** — every claim is traceable to a verified fact in your profile.
6. **Export as PDF** — ready to submit.

The AI won't invent skills you don't have. It will tell you where the gaps are so you can decide whether to apply anyway.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** SQLite (MVP), PostgreSQL for production
- **AI:** OpenAI GPT-4o-mini with structured JSON outputs
- **PDF:** HTML-to-PDF generation
- **Deployment:** Vercel
- **Validation:** Zod

## Quick Start

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/applymate.git
cd applymate

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your OpenAI API key

# Initialize the database
npx prisma db push

# Run the dev server
npm run dev


Author: Chris Kariofyllis

Built because tailoring resumes by hand is a waste of a good engineer's time.