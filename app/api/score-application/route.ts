import { NextRequest, NextResponse } from 'next/server';
import { scoreResumeForJob } from '@/lib/gemini';
import { extractResumeTextFromUrl } from '@/lib/resumeText';
import { supabase } from '@/lib/supabase';

function getResumeEvidenceBonus(extractedText: string): number {
  const length = extractedText.trim().length;
  if (length >= 2500) return 12;
  if (length >= 1500) return 9;
  if (length >= 800) return 6;
  if (length >= 300) return 3;
  return 0;
}

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
    const hasResumeUrl = !!candidate.resume_url?.trim();

    // Resume is mandatory for ATS scoring; without resume we keep score at 0.
    if (!hasResumeUrl) {
      const score = 0;
      await supabase.from('applications').update({ ai_score: score }).eq('id', applicationId);
      return NextResponse.json({ score });
    }

    const resumeParts: string[] = [];
    resumeParts.push(`Candidate: ${candidate.full_name || 'Unknown'}`);
    if (hasEducation) resumeParts.push(`Education: ${candidate.education}`);
    if (hasExperience) resumeParts.push(`Experience: ${candidate.experience_years} years`);
    if (hasSkills) resumeParts.push(`Skills: ${candidate.skills}`);
    if (hasResumeUrl) resumeParts.push(`Resume URL: ${candidate.resume_url}`);

    const extractedResumeText = hasResumeUrl
      ? await extractResumeTextFromUrl(candidate.resume_url)
      : '';

    if (hasResumeUrl && !extractedResumeText) {
      console.warn(`Resume extraction failed for application ${applicationId}; using profile summary fallback.`);
    }

    const summaryText = resumeParts.join('\n');
    const resumeText = extractedResumeText
      ? `${extractedResumeText}\n\n--- PROFILE SUMMARY ---\n${summaryText}`
      : summaryText;

    const score = await scoreResumeForJob(
      candidate.id,
      candidate.full_name,
      candidate.education || '',
      candidate.experience_years || 0,
      candidate.skills || '',
      candidate.resume_url || '',
      resumeText,
      job.title,
      job.description || 'Position seeking qualified candidate',
      job.required_skills || '',
      job.min_experience || 0
    );

    const finalScore = Math.min(100, score + getResumeEvidenceBonus(extractedResumeText));

    const { error: updateError } = await supabase
      .from('applications')
      .update({ ai_score: finalScore })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application score:', updateError);
    }

    return NextResponse.json({ score: finalScore });
  } catch (error) {
    console.error('Error in score-application API:', error);
    return NextResponse.json(
      { error: 'Failed to score application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
