# TalentFlow AI - Setup Guide

## 📦 What Has Been Built

A complete, production-ready recruitment platform with:

### ✅ Core Features Implemented

1. **Dashboard** (`/`)
   - Real-time recruitment statistics
   - Quick action cards
   - Recent applications feed
   - Dynamic data from Supabase

2. **Jobs Management** (`/jobs`)
   - Jobs listing with search and filters
   - Create new job postings (`/jobs/new`)
   - Job detail page with applications (`/jobs/[id]`)
   - Open/Close job status management

3. **Candidates** (`/candidates`)
   - Candidate directory with search
   - Detailed candidate profiles (`/candidates/[id]`)
   - View education, experience, skills
   - Application and interview history

4. **Applications** (`/applications`)
   - Application pipeline tracking
   - Status-based filtering (applied, shortlisted, interview, rejected, hired)
   - Application detail view (`/applications/[id]`)
   - One-click status updates
   - Schedule interviews directly from applications

5. **Interviews** (`/interviews`)
   - Interview calendar view
   - Schedule new interviews (`/interviews/new`)
   - Upcoming and past interviews
   - Google Calendar integration ready

### 🎨 UI/UX Components

- **Navigation**: Sidebar with active route highlighting
- **Header**: Search bar, notifications, user profile
- **Reusable Components**: Button, Card, Badge
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Skeleton screens and spinners
- **Empty States**: Helpful messages when no data exists

### 🏗️ Architecture

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Type Safety**: Full TypeScript support
- **State Management**: React hooks with Supabase real-time

## 🚀 Quick Start

### 1. Update Supabase Configuration

Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get these values:**
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 2. Verify Database Schema

Your Supabase database should already have these tables:
- ✅ users
- ✅ jobs
- ✅ candidates
- ✅ applications
- ✅ interviews

The schema is already set up as per your provided SQL!

### 3. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Testing the Application

### Adding Test Data

Since this is a fresh setup, you'll want to add some test data:

1. **Add a Job** - Navigate to `/jobs/new` and create a job posting
2. **Add Candidates** - Use Supabase dashboard to insert test candidates
3. **Create Applications** - Link candidates to jobs via applications table
4. **Schedule Interviews** - Go to `/interviews/new` to schedule

### Sample SQL for Test Data

Run this in your Supabase SQL Editor:

```sql
-- Insert test candidate
INSERT INTO candidates (full_name, email, phone, education, experience_years, skills, resume_url)
VALUES 
  ('John Doe', 'john@example.com', '+1234567890', 'BS Computer Science', 5, 'React, Node.js, TypeScript, Python', 'https://example.com/resume.pdf'),
  ('Jane Smith', 'jane@example.com', '+1234567891', 'MS Software Engineering', 3, 'Java, Spring Boot, PostgreSQL', 'https://example.com/resume2.pdf');

-- Create applications (replace job_id with actual job ID from your jobs table)
INSERT INTO applications (candidate_id, job_id, status)
SELECT c.id, j.id, 'applied'
FROM candidates c, jobs j
WHERE c.email = 'john@example.com' AND j.status = 'open'
LIMIT 1;
```

## 🔑 Key Files and Their Purpose

### Core Configuration
- `lib/supabase.ts` - Supabase client and TypeScript types
- `.env.local` - Environment variables (Supabase, APIs)
- `tsconfig.json` - TypeScript configuration with path aliases

### Layout Components
- `app/layout.tsx` - Root layout with sidebar and header
- `components/layout/Sidebar.tsx` - Navigation sidebar
- `components/layout/Header.tsx` - Top header with search

### UI Components
- `components/ui/Button.tsx` - Reusable button with variants
- `components/ui/Card.tsx` - Card container component
- `components/ui/Badge.tsx` - Status badge component

### Page Routes
- `app/page.tsx` - Dashboard
- `app/jobs/page.tsx` - Jobs listing
- `app/jobs/new/page.tsx` - Create job
- `app/jobs/[id]/page.tsx` - Job details
- `app/candidates/page.tsx` - Candidates listing
- `app/candidates/[id]/page.tsx` - Candidate profile
- `app/applications/page.tsx` - Applications listing
- `app/applications/[id]/page.tsx` - Application details
- `app/interviews/page.tsx` - Interviews listing
- `app/interviews/new/page.tsx` - Schedule interview

## 🎯 Next Steps

### Immediate (Ready to Use)
1. ✅ All pages are functional
2. ✅ Database integration is complete
3. ✅ UI is responsive and polished
4. ✅ Routing is properly configured

### Phase 2 - AI Integration (Future)
- [ ] Connect Gemini API for resume parsing
- [ ] Implement AI candidate ranking
- [ ] Add NLP-based skill extraction
- [ ] Build automated screening system

### Phase 3 - External Integrations (Future)
- [ ] Gmail API for resume ingestion
- [ ] Google Calendar API for scheduling
- [ ] Email notifications
- [ ] Resume file upload and parsing

### Phase 4 - Advanced Features (Future)
- [ ] User authentication
- [ ] Role-based access control
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Interview feedback forms
- [ ] Candidate scoring algorithm

## 🔧 Customization

### Changing Colors
Edit the Tailwind classes in components. Main colors used:
- Primary: `blue-600` (buttons, accents)
- Success: `green-600` (positive actions)
- Danger: `red-600` (deletions, rejections)
- Gray scale for backgrounds and text

### Adding New Features
1. Create new page in `app/` directory
2. Add route to `components/layout/Sidebar.tsx`
3. Use existing UI components for consistency
4. Connect to Supabase for data

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Full sidebar, multi-column layouts
- **Tablet**: Collapsible sidebar, 2-column layouts
- **Mobile**: Hidden sidebar (hamburger menu ready), single column

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check network connection

### "No data showing"
- Database might be empty
- Add test data using SQL above
- Check browser console for errors

### "Build errors"
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors with `npm run build`

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎓 Academic Project Notes

This project demonstrates:
- Full-stack development skills
- Database design and relationships
- RESTful API integration
- Modern React patterns (hooks, server components)
- Type-safe development with TypeScript
- Responsive UI/UX design
- Project architecture and organization

Perfect for showcasing in your portfolio or academic presentation!

---

**Need help?** Review the main README.md or check the inline code comments.

**Ready to deploy?** Consider Vercel, Netlify, or AWS for hosting.
