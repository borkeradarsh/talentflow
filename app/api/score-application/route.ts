import { NextRequest, NextResponse } from 'next/server';
import { scoreResumeForJob } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        candidates (*),
        jobs (*)
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const candidate = application.candidates;
    const job = application.jobs;

    if (!candidate || !job) {
      return NextResponse.json(
        { error: 'Invalid application data' },
        { status: 400 }
      );
    }

    const hasEducation = !!candidate.education?.trim();
    const hasSkills = !!candidate.skills?.trim();
    const hasExperience = (candidate.experience_years || 0) > 0;

    if (!hasEducation && !hasSkills && !hasExperience) {
      const score = 0;
      await supabase.from('applications').update({ ai_score: score }).eq('id', applicationId);
      return NextResponse.json({ score });
    }

    const score = await scoreResumeForJob(
      candidate.id,
      candidate.full_name,
      candidate.education || '',
      candidate.experience_years || 0,
      candidate.skills || '',
      candidate.resume_url || '',
      job.title,
      job.description || 'Position seeking qualified candidate',
      job.required_skills || '',
      job.min_experience || 0
    );

    const { error: updateError } = await supabase
      .from('applications')
      .update({ ai_score: score })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application score:', updateError);
    }

    return NextResponse.json({ score });
  } catch (error) {
    console.error('Error in score-application API:', error);
    return NextResponse.json(
      { error: 'Failed to score application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
