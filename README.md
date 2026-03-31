# TalentFlow AI - Intelligent Recruitment Platform

An AI-driven hiring automation platform designed to streamline and optimize the end-to-end recruitment workflow.

## Features

- **Dashboard**: Real-time recruitment metrics and statistics
- **Job Management**: Create, manage, and track job postings
- **Candidate Tracking**: Comprehensive candidate profiles and history
- **Application Pipeline**: Track applications through different stages
- **Interview Scheduling**: Automated interview scheduling with Google Calendar integration
- **AI-Powered Screening**: Resume parsing and candidate evaluation using NLP and ML

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend & Database**: Supabase (PostgreSQL)
- **AI Engine**: Gemini 2.5 Flash API
- **Integrations**: Gmail API, Google Calendar API
- **Icons**: Lucide React

## Installation

### Prerequisites

- Node.js 20+ installed
- A Supabase account and project
- Gmail API credentials (for resume ingestion)
- Google Calendar API credentials (for interview scheduling)
- Gemini API key (for AI processing)

### Setup Steps

1. **Clone and Install Dependencies**
   ```bash
   cd talentflow
   npm install
   ```

2. **Configure Environment Variables**
   
   Update the `.env.local` file with your credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Gmail API
   GMAIL_CLIENT_ID=your_gmail_client_id
   GMAIL_CLIENT_SECRET=your_gmail_client_secret

   # Google Calendar API
   GOOGLE_CALENDAR_CLIENT_ID=your_calendar_client_id
   GOOGLE_CALENDAR_CLIENT_SECRET=your_calendar_client_secret

   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Set Up Supabase Database**
   
   The database schema is already created. Make sure your Supabase project has the following tables:
   - `users` - User management
   - `jobs` - Job postings
   - `candidates` - Candidate profiles
   - `applications` - Job applications
   - `interviews` - Interview scheduling

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open Your Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
talentflow/
├── app/
│   ├── layout.tsx                 # Root layout with navigation
│   ├── page.tsx                   # Dashboard
│   ├── jobs/
│   │   ├── page.tsx              # Jobs listing
│   │   ├── new/page.tsx          # Create new job
│   │   └── [id]/page.tsx         # Job details
│   ├── candidates/
│   │   ├── page.tsx              # Candidates listing
│   │   └── [id]/page.tsx         # Candidate profile
│   ├── applications/
│   │   ├── page.tsx              # Applications listing
│   │   └── [id]/page.tsx         # Application details
│   └── interviews/
│       ├── page.tsx              # Interviews listing
│       └── new/page.tsx          # Schedule interview
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── Header.tsx            # Top header
│   └── ui/
│       ├── Button.tsx            # Reusable button
│       ├── Card.tsx              # Card component
│       └── Badge.tsx             # Status badge
├── lib/
│   └── supabase.ts               # Supabase client & types
└── .env.local                     # Environment variables
```

## Key Pages

### Dashboard (`/`)
- Overview of recruitment metrics
- Quick stats on candidates, jobs, and applications
- Recent applications feed
- Quick action cards

### Jobs (`/jobs`)
- View all job postings
- Filter by status (open/closed)
- Create new job postings
- Manage job details and applications

### Candidates (`/candidates`)
- Browse all candidates
- Search by name, email, or skills
- View detailed candidate profiles
- Track candidate applications and interviews

### Applications (`/applications`)
- Track all job applications
- Filter by status (applied, shortlisted, interview, rejected, hired)
- Update application status
- Quick access to candidate profiles

### Interviews (`/interviews`)
- View scheduled interviews
- Schedule new interviews
- Track interview status
- Upcoming and past interviews

## Database Schema

The application uses the following database structure:

- **users**: Store recruiter/admin user information
- **jobs**: Job postings with requirements and status
- **candidates**: Candidate profiles with resume data
- **applications**: Link candidates to jobs with application status
- **interviews**: Schedule and track interviews

## Future Enhancements

- Resume auto-ingestion from Gmail
- AI-powered resume parsing and ranking
- Automated interview feedback analysis
- Advanced bias detection
- Multi-language support
- Integration with additional job portals
- Real-time notifications
- Video interview integration

## Notes

- Make sure to configure your Supabase project URL and API keys
- Gmail and Google Calendar APIs need to be set up in Google Cloud Console
- The Gemini API key is required for AI-powered features
- For production deployment, ensure all environment variables are properly set

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Contributing

This is an academic project for Computer Science major. Contributions and suggestions are welcome!

## License

Academic Project - 2026

---

Built with Next.js, Supabase, and AI

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
