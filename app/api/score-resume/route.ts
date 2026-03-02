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

    // Fetch candidate data
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

    // Generate resume score
    const score = await scoreResume(
      `Profile of ${candidate.full_name}. Professional with background in their field.`,
      candidate.full_name,
      candidate.education || '',
      candidate.experience_years || 0,
      candidate.skills || ''
    );

    // Update candidate record with the score
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
