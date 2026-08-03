# ApplyMate

> Your personal AI career assistant for job matching and tailored resumes.

ApplyMate helps you understand how well a job fits your experience and create a targeted resume without inventing skills, achievements, or work experience.

> **Status:** Early-stage MVP and work in progress.

## The Problem

Applying for jobs takes time.

Finding relevant positions, understanding job requirements, comparing them with your experience, and tailoring your resume for every application can become difficult — especially when you already work full-time.

Many people either:

- Use the same resume for every application
- Spend too much time manually adapting their resume
- Miss important gaps in their experience
- Use AI tools that generate unsupported or exaggerated claims
- Share their entire career history with third-party platforms without knowing how it is handled

## What ApplyMate Does

ApplyMate follows a simple workflow:

1. Build your career profile once.
2. Add your experience, education, skills, languages, and achievements.
3. Paste a job description or job posting URL.
4. Analyze the position and extract its main requirements.
5. Compare the job with your profile.
6. Show strengths, gaps, and missing information.
7. Ask a few questions only when important information is missing.
8. Generate a tailored resume based on confirmed information.
9. Review the result before exporting it.

The goal is not to create fake resumes.

The goal is to make it easier to present your real experience in a clear and relevant way for each job application.

## Core Principles

### No invented experience

Generated resumes should only use information provided or confirmed by the user.

The system should not invent:

- Skills
- Job responsibilities
- Achievements
- Certifications
- Years of experience
- Technologies
- Languages
- Quantitative results

### Transparent matching

ApplyMate does not try to predict the exact probability of getting hired.

Instead, it shows:

- Which requirements match your profile
- Which requirements are only partially covered
- Which requirements are missing
- Which information is still unknown
- How confident the analysis is
- Whether the position seems worth applying for

### Human approval

The AI creates suggestions and drafts.

The user remains in control and should approve the final resume before exporting or submitting it.

### User-controlled AI provider

The long-term goal is to support a BYOK model:

> Bring Your Own Key

Users should be able to choose which AI provider they want to use and keep control of their own API usage.

The current MVP uses an environment variable for local development.

## Current MVP Scope

The first version focuses on the core workflow:

- Career profile creation
- Work experience and education management
- Job description analysis
- Match report generation
- Strengths and gaps detection
- Clarification questions
- Tailored resume generation
- Resume preview
- HTML export
- SQLite database for local development
- OpenAI integration

The first MVP does not include:

- Gmail or XING automation
- Telegram integration
- Canva integration
- Automatic job applications
- Multi-user authentication
- Billing
- Background workers
- Multiple AI providers
- Full production-grade PDF generation

These features may be added later if the core workflow proves useful.

## Example Workflow

```text
Create your profile
        ↓
Add experience, education and skills
        ↓
Paste a job description
        ↓
Analyze the job
        ↓
Compare the job with your profile
        ↓
Review strengths and gaps
        ↓
Answer clarification questions
        ↓
Generate a tailored resume
        ↓
Review and export
```

## Example Match Report

```text
Role: Project Manager
Company: Example GmbH
Location: Munich

Match score: 7.2 / 10
Recommendation: Good match

Strengths:
- Project coordination experience
- Stakeholder communication
- Reporting and documentation
- Experience working with cross-functional teams

Gaps:
- SAP experience is not confirmed
- German language level is not available
- The job asks for five years of experience

Questions:
- Have you worked with SAP?
- What is your current German language level?
```

The score is intended as an indication of profile alignment, not as a prediction of hiring probability.

## Tech Stack

- **Framework:** Next.js with App Router
- **Language:** TypeScript
- **UI:** React and Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Prisma with SQLite for the MVP
- **AI:** OpenAI API with structured JSON responses
- **Validation:** Zod
- **Deployment:** Vercel
- **Version control:** Git and GitHub

## Project Structure

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
│       │   └── analyze/
│       │       └── route.ts
│       ├── match/
│       │   ├── route.ts
│       │   └── answer/
│       │       └── route.ts
│       └── resume/
│           ├── generate/
│           │   └── route.ts
│           └── export/
│               └── route.ts
│
├── components/
│   ├── ui/
│   ├── profile/
│   ├── jobs/
│   ├── match/
│   └── resume/
│
├── lib/
│   ├── ai/
│   │   ├── client.ts
│   │   ├── analyze-job.ts
│   │   ├── score-match.ts
│   │   ├── generate-questions.ts
│   │   └── generate-resume.ts
│   ├── pdf/
│   ├── db.ts
│   └── utils.ts
│
└── types/
    └── index.ts

prisma/
└── schema.prisma

public/
└── templates/

tests/
├── analyze-job.test.ts
└── score-match.test.ts
```

## Data Model

The application stores the following main entities:

- `Profile`
- `Fact`
- `Experience`
- `Education`
- `Job`
- `Match`
- `Resume`

A career fact may represent information such as:

```json
{
  "category": "skill",
  "key": "python",
  "value": "Used Python for automation and data processing",
  "confidence": "user_confirmed",
  "source": "user_input",
  "allowedInCv": true
}
```

Each fact should have a confidence level and a source.

This makes it possible to distinguish between:

- Information confirmed by the user
- Information extracted from a document
- Information inferred by the AI
- Information that still needs verification

## Getting Started

### Prerequisites

Before running the project locally, install:

- Node.js 18 or newer
- npm
- Git
- An OpenAI API key

### Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/applymate.git
cd applymate
```

Replace `YOUR_USERNAME` with your GitHub username.

### Install dependencies

```bash
npm install
```

### Create environment variables

Create a file named `.env.local` in the project root:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your-openai-api-key"
```

Never commit `.env.local` to GitHub.

The `.env.local` file should be included in `.gitignore`.

### Initialize the database

```bash
npx prisma generate
npx prisma db push
```

Optional Prisma commands:

```bash
npx prisma studio
```

The Prisma Studio command opens a local interface for viewing and editing database records.

### Run the development server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

## Available Scripts

```bash
# Start the development server
npm run dev

# Create a production build
npm run build

# Start the production server
npm run start

# Run ESLint
npm run lint

# Generate the Prisma client
npx prisma generate

# Update the local database schema
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## Environment Variables

The current MVP uses the following environment variables:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your-openai-api-key"
```

### Important

Do not:

- Commit `.env.local`
- Share your API key
- Put your API key in frontend code
- Hardcode secrets in source files
- Upload secrets in screenshots or documentation

For a future multi-user version, the project may support encrypted per-user API keys or a fully local/self-hosted setup.

## Deploying to Vercel

The application can be deployed to Vercel.

### Option 1: Import from GitHub

1. Push the project to GitHub.
2. Open Vercel.
3. Import the GitHub repository.
4. Add the required environment variables.
5. Deploy the project.

Required environment variables:

```env
DATABASE_URL="your-database-connection-string"
OPENAI_API_KEY="your-openai-api-key"
```

### Option 2: Deploy from the command line

Install the Vercel CLI:

```bash
npm install -g vercel
```

Then run:

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

### Database note

SQLite is suitable for local development and the early MVP.

For a production deployment on Vercel, a hosted database such as PostgreSQL will probably be more appropriate. Possible options include:

- Supabase
- Neon
- Railway
- Another PostgreSQL provider

The database configuration should be reviewed before using the application with real personal data.

## AI Behaviour

The AI is used for:

- Extracting job requirements
- Comparing job requirements with the career profile
- Identifying strengths and gaps
- Creating clarification questions
- Generating a tailored resume draft

AI output should always be treated as a draft.

The application should validate AI responses before storing them or displaying them.

The system should also make it clear when information is:

- Confirmed
- Missing
- Inferred
- Uncertain

## Privacy and Security

Career profiles and resumes may contain sensitive personal information.

The project should follow these principles:

- Store only the information required by the application.
- Do not expose API keys to the browser.
- Do not commit secrets to the repository.
- Provide a way to delete user data in future versions.
- Avoid sending unnecessary personal information to AI providers.
- Do not use generated content without reviewing it.
- Do not allow unverified claims to be silently added to resumes.

This project is not intended to make hiring decisions for employers.

It is a candidate-side tool for organizing career information and preparing job applications.

## Roadmap

### MVP

- [ ] Career profile builder
- [ ] Work experience management
- [ ] Education management
- [ ] Skills and facts management
- [ ] Job description input
- [ ] Job posting analysis
- [ ] Match report
- [ ] Strengths and gaps
- [ ] Clarification questions
- [ ] Tailored resume generation
- [ ] Resume preview
- [ ] Basic HTML export

### Future Features

- [ ] PDF export
- [ ] DOCX export
- [ ] Gmail job alert integration
- [ ] XING job alert integration
- [ ] Telegram bot
- [ ] Google Apps Script integration
- [ ] Multiple AI providers
- [ ] Anthropic support
- [ ] Google Gemini support
- [ ] OpenRouter support
- [ ] Ollama and local models
- [ ] User authentication
- [ ] PostgreSQL support
- [ ] Docker self-hosting
- [ ] Resume version history
- [ ] Approval workflow
- [ ] Canva template integration
- [ ] Job application tracking
- [ ] Browser extension
- [ ] Multi-language support

## Contributing

Contributions are welcome.

Before opening a pull request:

1. Create a separate branch.
2. Keep changes focused.
3. Run the linter.
4. Test the affected functionality.
5. Update the documentation when necessary.
6. Do not commit secrets or personal data.

Example:

```bash
git checkout -b feature/job-analysis-improvements
git add .
git commit -m "Improve job posting analysis"
git push origin feature/job-analysis-improvements
```

Then open a pull request on GitHub.

## Development Guidelines

- Use TypeScript.
- Keep API responses predictable.
- Validate incoming data.
- Validate AI-generated JSON with Zod.
- Use clear error messages.
- Avoid putting business logic directly inside React components.
- Keep AI provider code separate from the application logic.
- Prefer small, focused functions.
- Add tests for important logic.
- Do not add features outside the current scope without discussing them first.

## License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

## Author

Created by **Chris Kariofyllis**.

- GitHub: https://github.com/ChrisKariofyllis
- Personal Website: https://www.chriskariofyllis.com/

## Project Status

ApplyMate is currently an early-stage open-source project.

The architecture and features may change while the MVP is being developed.

Feedback, ideas, bug reports, and contributions are welcome.

---

Built to make thoughtful job applications easier — without making things up.