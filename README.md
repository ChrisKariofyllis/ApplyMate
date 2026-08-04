# ApplyMate

ApplyMate is a local AI career assistant that compares your profile against a job description and helps you generate a tailored resume from information you have confirmed.

It is built as an open-core project: **ApplyMate Core** is the local/self-hosted MVP you can run today. **ApplyMate Cloud** is a planned hosted direction, not a shipped product.

## Current status

ApplyMate Core is a working local MVP. The main browser flow runs end to end:

**Profile → Job analysis → Match → Questions → Resume generation → Resume preview → HTML download**

It is suitable for local development and demos. It is not a production-ready multi-user SaaS.

## Open Core

### ApplyMate Core (available now)

ApplyMate Core is the local/self-hosted version. It currently includes:

- Career profile
- Job analysis
- Matching
- Clarification questions
- Tailored resume generation
- Resume preview
- HTML export
- BYOK through environment variables
- SQLite for local development
- PostgreSQL as the intended future/production database target

ApplyMate Core does **not** currently include:

- Authentication
- Multi-tenancy
- Credits
- Subscriptions
- Stripe
- Hosted database
- Admin panel
- Monitoring
- Gmail integration
- Telegram integration
- Automatic applications

Docker / self-hosted packaging is also not available yet. There is no `docker-compose` setup.

### ApplyMate Cloud (planned)

ApplyMate Cloud is a planned hosted direction. It may eventually offer:

- Hosted frontend
- Authentication
- Multi-user accounts
- PostgreSQL
- Credits and subscriptions
- Stripe billing
- Shared hosted AI provider
- Gmail / Telegram integrations
- Admin and monitoring

Cloud features are not implemented yet.

## What works today

- [x] Career profile creation and editing
- [x] Work experience and education management
- [x] Facts preserved when saving the profile
- [x] Job description analysis from pasted text
- [x] Job analysis from URL
- [x] Job requirements extraction
- [x] Match scoring
- [x] Strengths and gaps
- [x] Clarification questions
- [x] Saving user answers as confirmed facts
- [x] Tailored resume generation
- [x] Resume preview
- [x] HTML download/export (not PDF)
- [x] Zod validation for AI responses
- [x] Local SQLite persistence
- [x] Custom OpenAI-compatible base URL through `OPENAI_BASE_URL`

## Core principles

- Do not invent experience, skills, or achievements.
- Prefer confirmed facts over guesses.
- Ask clarifying questions when important information is missing.
- Keep the workflow inspectable: profile, match, questions, then resume.
- Keep API keys server-side.
- Treat the match score as guidance, not a hiring probability.

## Current workflow

1. Create or edit your career profile.
2. Paste a job description or provide a job URL.
3. Analyze the job and extract requirements.
4. Run a match against your profile.
5. Review strengths, gaps, and clarification questions.
6. Answer questions; answers are saved as confirmed facts.
7. Generate a tailored resume.
8. Preview the resume.
9. Download/export it as HTML.

## Screens / features

| Area | What it does |
|------|----------------|
| Profile | Create and edit personal details, experience, education, and related facts |
| Jobs | Paste text or fetch a URL, then analyze requirements |
| Match | Score the fit, list strengths/gaps, and surface clarification questions |
| Questions | Capture answers and store them as confirmed facts |
| Resume | Generate a tailored resume from confirmed profile data |
| Preview / export | Review the result and download ATS-friendly HTML |

## Tech stack

- Next.js 14.2 (App Router)
- React
- TypeScript
- Tailwind CSS
- ESLint
- Prisma 6
- SQLite for local development
- OpenAI SDK against an OpenAI-compatible endpoint
- Zod
- Vercel as a possible hosting target after a PostgreSQL migration

Notes:

- The active AI model is `gpt-4o-mini`.
- `OPENAI_BASE_URL` is optional. If omitted, the default OpenAI endpoint is used.
- The API key is server-side only.
- The Vercel AI SDK package (`ai`) is installed, but the current structured calls use the OpenAI SDK wrapper.
- Packages such as `pdf-parse` and `uuid` may exist in `package.json`, but they are not part of the main browser flow today.

## Project structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── jobs/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── resumes/
│   │   └── [id]/
│   │       └── page.tsx
│   └── api/
│       ├── profile/
│       │   └── route.ts
│       ├── jobs/
│       │   ├── route.ts
│       │   ├── analyze/
│       │   │   └── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── match/
│       │   ├── route.ts
│       │   └── answer/
│       │       └── route.ts
│       └── resume/
│           ├── [id]/
│           │   └── route.ts
│           ├── generate/
│           │   └── route.ts
│           └── export/
│               └── route.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── ScoreCircle.tsx
│   │   └── LoadingSpinner.tsx
│   ├── jobs/
│   │   └── JobInput.tsx
│   ├── match/
│   │   ├── MatchReport.tsx
│   │   └── QuestionsPanel.tsx
│   └── resume/
│       └── ResumePreview.tsx
├── lib/
│   ├── ai/
│   │   ├── client.ts
│   │   └── schemas.ts
│   ├── pdf/
│   │   └── generate-pdf.ts
│   ├── db.ts
│   └── utils.ts
└── types/
    └── index.ts

prisma/
└── schema.prisma
```

`src/lib/pdf/generate-pdf.ts` currently generates ATS-friendly HTML. Despite the historical filename, it does not generate a real PDF.

## API routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` / `POST` | `/api/profile` | Load or create/update the career profile |
| `GET` | `/api/jobs` | List analyzed jobs |
| `POST` | `/api/jobs/analyze` | Analyze a job from pasted text or URL |
| `GET` | `/api/jobs/[id]` | Fetch a single job and related match data |
| `POST` | `/api/match` | Run match analysis for a job against the profile |
| `POST` | `/api/match/answer` | Save a clarification answer as a confirmed fact |
| `POST` | `/api/resume/generate` | Generate a tailored resume for a match |
| `GET` | `/api/resume/[id]` | Fetch a generated resume |
| `POST` | `/api/resume/export` | Export/download the resume as HTML |

## Data model

Prisma models currently used:

- **Profile** — personal details and relations to facts, experience, education, matches, and resumes
- **Fact** — confirmed or inferred career facts used during matching and resume generation
- **Experience** — work history entries
- **Education** — education entries
- **Job** — raw description plus extracted requirements
- **Match** — score, strengths, gaps, questions, and recommendation
- **Resume** — tailored resume content linked to a match/job/profile

Local persistence uses SQLite via `DATABASE_URL`.

## Getting started

```bash
git clone git@github.com:ChrisKariofyllis/ApplyMate.git
cd ApplyMate
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open:

```text
http://localhost:3000
```

Notes:

- The first version is intended for local development.
- A real API key is required for AI features.
- `.env.local` is ignored by Git.
- `npm run lint` and `npm run build` should pass before opening a pull request.

Useful scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
npx prisma generate
npx prisma db push
npx prisma studio
```

## Environment variables

Create a local env file (for example `.env.local`):

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your-api-key-here"
OPENAI_BASE_URL="https://api.myapi.world"
```

Details:

- `OPENAI_BASE_URL` is optional.
- Use the provider's documented base URL.
- If the provider documents `/v1/chat/completions`, set the base URL to the `/v1` part.
- Never commit `.env` or `.env.local`.
- Never expose the API key through a `NEXT_PUBLIC_` variable.
- The working database path must stay consistent between the Prisma CLI and the Next.js runtime.
- If you use separate `.env` and `.env.local` files, keep `DATABASE_URL` consistent in both, or use one consistent environment file.

## Local development

1. Install dependencies with `npm install`.
2. Generate the Prisma client with `npx prisma generate`.
3. Create/update the local SQLite schema with `npx prisma db push`.
4. Start the app with `npm run dev`.
5. Use `npx prisma studio` if you want to inspect local data.

AI calls go through the server-side OpenAI-compatible client in `src/lib/ai/client.ts`. Responses are validated with Zod schemas in `src/lib/ai/schemas.ts`.

## Vercel and production notes

- Vercel can host the Next.js application.
- SQLite should not be used as persistent production storage on Vercel.
- Before production, migrate Prisma from SQLite to PostgreSQL.
- Possible providers: Supabase, Neon, Railway, or another PostgreSQL provider.
- Add `DATABASE_URL`, `OPENAI_API_KEY`, and optionally `OPENAI_BASE_URL` to Vercel environment variables.
- Authentication, multi-tenancy, rate limiting, and SSRF protection are required before a public deployment.
- The current project is suitable for local/demo use, not an unrestricted public SaaS deployment.

## Privacy and security

- Career profiles and resumes may contain sensitive personal information.
- API keys stay server-side.
- Do not commit secrets.
- Review generated resumes before using them.
- Do not treat the match score as a hiring probability.
- Do not use this tool for employer-side automated hiring decisions.
- Public deployment requires authentication, rate limiting, SSRF protection, and a production database.
- Check the AI provider's commercial-use and data-retention terms before using it as part of a paid cloud service.

## Known limitations

- The current Core MVP is single-user and uses the first profile.
- There is no authentication or multi-tenancy.
- SQLite is intended for local development, not persistent Vercel production storage.
- Production deployment should use PostgreSQL.
- There is no real PDF export yet; the current export is HTML.
- There are no automated tests yet.
- There is no rate limiting or usage quota.
- The URL fetch flow still needs SSRF hardening before public deployment.
- Re-running match analysis can create multiple match records.
- Answers are saved as facts, but the match must currently be re-analyzed to calculate a new score.
- The UI still needs a final polish pass.
- The project has not yet been hardened for public multi-user use.

## Roadmap

### Core polish

- [ ] Remove duplicate question display
- [ ] Add answered-question state
- [ ] Decide whether to upsert or archive repeated matches
- [ ] Re-analyze match after new confirmed answers
- [ ] Add automated tests
- [ ] Harden URL fetching against SSRF
- [ ] Add request limits and rate limiting
- [ ] Rename the historical `generate-pdf.ts` helper to an HTML-specific name
- [ ] Improve UI consistency and empty/error states

### Core extensions

- [ ] Real PDF export
- [ ] DOCX export
- [ ] PostgreSQL setup for production
- [ ] Optional Docker / self-hosted packaging
- [ ] Resume version history
- [ ] More complete BYOK / provider configuration
- [ ] Additional AI providers
- [ ] Local model support

### ApplyMate Cloud

- [ ] Authentication
- [ ] Multi-tenancy
- [ ] User accounts
- [ ] Credits
- [ ] Subscriptions
- [ ] Stripe integration
- [ ] Hosted AI keys
- [ ] Gmail integration
- [ ] Telegram integration
- [ ] Admin tools
- [ ] Monitoring
- [ ] Usage limits and abuse protection

## Contributing

This is still an early Core MVP. Useful contributions are small, focused changes that improve reliability, clarity, or safety.

Before opening a pull request:

1. Run `npm run lint`
2. Run `npm run build`
3. Keep the change scoped
4. Do not commit secrets or local database files

## Author

Created by Chris Kariofyllis

- GitHub: https://github.com/ChrisKariofyllis
- Personal website: https://www.chriskariofyllis.com/

## License / status note

License: The licensing terms are not finalized yet.

If you are trying ApplyMate Core locally, start with a real profile and one job posting, then walk the full flow once before changing anything.
