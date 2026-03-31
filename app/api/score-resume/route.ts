import { NextRequest, NextResponse } from 'next/server';
import { scoreResume } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
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

    const hasEducation = !!candidate.education?.trim();
    const hasSkills = !!candidate.skills?.trim();
    const hasExperience = (candidate.experience_years || 0) > 0;

    if (!hasEducation && !hasSkills && !hasExperience) {
      const score = 0;
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ resume_score: score })
        .eq('id', candidateId);
      if (updateError) console.error('Error updating candidate score:', updateError);
      return NextResponse.json({ score });
    }

    const resumeParts: string[] = [];
    if (hasEducation) resumeParts.push(`Education: ${candidate.education}`);
    if (hasExperience) resumeParts.push(`Experience: ${candidate.experience_years} years`);
    if (hasSkills) resumeParts.push(`Skills: ${candidate.skills}`);
    const resumeText = resumeParts.join('\n');

    const score = await scoreResume(
      resumeText,
      candidate.full_name,
      candidate.education || '',
      candidate.experience_years || 0,
      candidate.skills || ''
    );

    const { error: updateError } = await supabase
      .from('candidates')
      .update({ resume_score: score })
      .eq('id', candidateId);

    if (updateError) {
      console.error('Error updating candidate score:', updateError);
    }

    return NextResponse.json({ score });
  } catch (error) {
    console.error('Error in score-resume API:', error);
    return NextResponse.json(
      { error: 'Failed to score resume', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
