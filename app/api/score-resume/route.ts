import { NextRequest, NextResponse } from 'next/server';
import { scoreResume } from '@/lib/gemini';
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
  let candidateResumeScore: number | null = null;

  try {
    const { candidateId } = await req.json();

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    const { data: candidate, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (error || !candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    candidateResumeScore = candidate.resume_score ?? null;

    const hasEducation = !!candidate.education?.trim();
    const hasSkills = !!candidate.skills?.trim();
    const hasExperience = (candidate.experience_years || 0) > 0;
    const hasResumeUrl = !!candidate.resume_url?.trim();

    // Resume is mandatory for ATS scoring; without resume we keep score at 0.
    if (!hasResumeUrl) {
      const score = 0;
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ resume_score: score })
        .eq('id', candidateId);
      if (updateError) console.error('Error updating candidate score:', updateError);
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
      console.warn(`Resume extraction failed for candidate ${candidateId}; using profile summary fallback.`);
    }

    const summaryText = resumeParts.join('\n');
    const resumeText = extractedResumeText
      ? `${extractedResumeText}\n\n--- PROFILE SUMMARY ---\n${summaryText}`
      : summaryText;

    const score = await scoreResume(
      resumeText,
      candidate.full_name,
      candidate.education || '',
      candidate.experience_years || 0,
      candidate.skills || '',
      'General ATS screening for profile completeness and role readiness.'
    );

    const finalScore = Math.min(100, score + getResumeEvidenceBonus(extractedResumeText));

    const { error: updateError } = await supabase
      .from('candidates')
      .update({ resume_score: finalScore })
      .eq('id', candidateId);

    if (updateError) {
      console.error('Error updating candidate score:', updateError);
    }

    return NextResponse.json({ score: finalScore });
  } catch (error) {
    console.error('Error in score-resume API:', error);

    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('429') || message.toLowerCase().includes('quota')) {
      return NextResponse.json(
        {
          error: 'Gemini quota exceeded. Please retry later.',
          score: candidateResumeScore,
          isStaleScore: candidateResumeScore !== null,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to score resume', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
