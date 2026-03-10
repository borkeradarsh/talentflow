# TalentFlow AI - API & Data Flow Reference

## 🔄 Data Flow Architecture

### Client → Supabase Direct Connection
This application uses Supabase's client-side SDK for direct database access. No custom API routes needed!

```
User Action → React Component → Supabase Client → PostgreSQL Database
```

## 📊 Database Queries by Page

### Dashboard (`/`)
```typescript
// Fetch all stats
supabase.from('candidates').select('*', { count: 'exact', head: true })
supabase.from('jobs').select('*', { count: 'exact', head: true })
supabase.from('applications').select('*', { count: 'exact', head: true })
supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('status', 'scheduled')

// Fetch recent applications with joins
supabase.from('applications').select(`
  *,
  candidates (full_name, email),
  jobs (title)
`).order('applied_at', { ascending: false }).limit(5)
```

### Jobs Page (`/jobs`)
```typescript
// List all jobs
supabase.from('jobs').select('*').order('created_at', { ascending: false })

// Filter by status
supabase.from('jobs').select('*').eq('status', 'open')

// Get single job with applications
supabase.from('jobs').select('*').eq('id', jobId).single()
supabase.from('applications').select(`
  *,
  candidates (full_name, email, skills)
`).eq('job_id', jobId)

// Create new job
supabase.from('jobs').insert([{ title, description, ... }])

// Update job status
supabase.from('jobs').update({ status: 'closed' }).eq('id', jobId)
```

### Candidates Page (`/candidates`)
```typescript
// List all candidates
supabase.from('candidates').select('*').order('created_at', { ascending: false })

// Get single candidate with relations
supabase.from('candidates').select('*').eq('id', candidateId).single()
supabase.from('applications').select(`
  *,
  jobs (title, status)
`).eq('candidate_id', candidateId)
supabase.from('interviews').select(`
  *,
  jobs (title)
`).eq('candidate_id', candidateId)
```

### Applications Page (`/applications`)
```typescript
// List applications with filters
supabase.from('applications').select(`
  *,
  candidates (full_name, email, skills, experience_years),
  jobs (title, status)
`).eq('status', filter).order('applied_at', { ascending: false })

// Get single application
supabase.from('applications').select(`
  *,
  candidates (*),
  jobs (*)
`).eq('id', appId).single()

// Update application status
supabase.from('applications').update({ status: 'shortlisted' }).eq('id', appId)
```

### Interviews Page (`/interviews`)
```typescript
// List interviews
supabase.from('interviews').select(`
  *,
  candidates (full_name, email),
  jobs (title)
`).order('start_time', { ascending: true })

// Create new interview
supabase.from('interviews').insert([{
  candidate_id,
  job_id,
  start_time,
  end_time,
  status: 'scheduled'
}])
```

## 🔐 Row Level Security (RLS)

### Current Setup
RLS is likely **disabled** for development. For production, enable RLS in Supabase:

### Recommended Policies

```sql
-- Users table - users can only read their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Jobs table - authenticated users can view all jobs
CREATE POLICY "Anyone can view jobs"
ON jobs FOR SELECT
USING (true);

CREATE POLICY "Only admins can create jobs"
ON jobs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Candidates table - authenticated users can view all candidates
CREATE POLICY "Recruiters can view candidates"
ON candidates FOR SELECT
USING (true);

-- Applications table - authenticated users can view and manage
CREATE POLICY "Recruiters can manage applications"
ON applications FOR ALL
USING (true);

-- Interviews table - authenticated users can manage
CREATE POLICY "Recruiters can manage interviews"
ON interviews FOR ALL
USING (true);
```

## 🚀 Future API Extensions

### For AI Integration (Python Microservices)

```python
# Resume Parser Service
POST /api/parse-resume
Body: { resumeUrl: string }
Response: { skills: [], experience: number, education: string }

# Candidate Ranking Service
POST /api/rank-candidates
Body: { jobId: string, candidateIds: string[] }
Response: { rankings: [{ candidateId, score, reasoning }] }

# Gmail Integration Service
GET /api/fetch-resumes
Response: { newResumes: [{ from, subject, attachmentUrl }] }
```

### For Google Calendar Integration

```typescript
// Schedule interview and create calendar event
POST /api/schedule-interview
Body: {
  candidateEmail: string,
  jobTitle: string,
  startTime: string,
  endTime: string
}
Response: {
  interviewId: string,
  googleEventId: string,
  calendarLink: string
}
```

## 🔍 Search & Filter Patterns

### Client-side Search (Current)
```typescript
// Filter data already loaded
const filtered = items.filter(item =>
  item.name.toLowerCase().includes(query.toLowerCase())
);
```

### Server-side Search (Future Enhancement)
```typescript
// Use Supabase full-text search
supabase
  .from('candidates')
  .select('*')
  .textSearch('skills', query)
```

## 📈 Performance Optimization Tips

### 1. Use Select Filters
```typescript
// Only fetch needed columns
supabase.from('candidates').select('id, full_name, email')
```

### 2. Implement Pagination
```typescript
// Fetch 10 items at a time
supabase
  .from('applications')
  .select('*')
  .range(0, 9) // First page
  .range(10, 19) // Second page
```

### 3. Use Realtime Subscriptions
```typescript
// Subscribe to new applications
supabase
  .channel('applications')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'applications' },
    (payload) => {
      console.log('New application!', payload);
      // Update UI
    }
  )
  .subscribe()
```

## 🛡️ Error Handling Pattern

```typescript
async function fetchData() {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    
    if (error) throw error;
    
    setData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    // Show user-friendly error message
    alert('Failed to load data. Please try again.');
  } finally {
    setLoading(false);
  }
}
```

## 📝 Type Safety

All database types are defined in `lib/supabase.ts`:

```typescript
export type Job = {
  id: string;
  created_by: string;
  title: string;
  description: string;
  required_skills: string;
  min_experience: number;
  status: 'open' | 'closed';
  created_at: string;
};
```

Use these types in components:
```typescript
const [jobs, setJobs] = useState<Job[]>([]);
```

## 🔄 Real-time Updates (Optional)

To enable real-time features:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'applications' },
      (payload) => {
        // Handle insert, update, delete
        console.log('Change received!', payload);
        fetchApplications(); // Refresh data
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## 📚 Additional Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Database Relationships](https://supabase.com/docs/guides/database/joins-and-nested-tables)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

This reference provides a complete overview of how data flows through TalentFlow AI!
