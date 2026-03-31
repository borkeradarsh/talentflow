import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || 'REDACTED_API_KEY';
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not found, using hardcoded fallback');
}
const genAI = new GoogleGenerativeAI(API_KEY);

function profileCompleteness(
  education: string,
  experienceYears: number,
  skills: string
): { filled: number; ceiling: number; isEmpty: boolean } {
  let filled = 0;
  if (education && education.trim() && education.trim().toLowerCase() !== 'not specified') filled++;
  if (experienceYears > 0) filled++;
  if (skills && skills.trim() && skills.trim().toLowerCase() !== 'not specified') filled++;
  return {
    filled,
    ceiling: [0, 35, 65, 100][filled],
    isEmpty: filled === 0,
  };
}

function parseScore(text: string): number {
  const cleaned = text.replace(/[^0-9]/g, '');
  const score = parseInt(cleaned);
  if (isNaN(score) || score < 0 || score > 100) {
    throw new Error(`Invalid score from Gemini: "${text}"`);
  }
  return score;
}

export async function scoreResume(
  resumeText: string,
  candidateName: string,
  education: string,
  experienceYears: number,
  skills: string,
  jobRequirements?: string
): Promise<number> {
  try {
    console.log('Scoring resume for:', candidateName);

    const { filled, ceiling, isEmpty } = profileCompleteness(education, experienceYears, skills);

    if (isEmpty) {
      console.log('Empty profile, returning 0');
      return 0;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `<role>Strict ATS resume scoring engine. You score candidate profiles on a 0-100 scale.</role>

<examples>
Input: Education: EMPTY | Experience: EMPTY | Skills: EMPTY
Output: 0

Input: Education: BSc Computer Science | Experience: EMPTY | Skills: EMPTY
Output: 12

Input: Education: EMPTY | Experience: 2 years | Skills: Python, SQL
Output: 28

Input: Education: BSc Computer Science | Experience: 3 years | Skills: Python, React, Node.js
Output: 55

Input: Education: MSc Computer Science | Experience: 6 years | Skills: Python, Java, AWS, Docker, Kubernetes, React, PostgreSQL
Output: 78

Input: Education: PhD Machine Learning, Stanford | Experience: 10 years | Skills: Python, TensorFlow, PyTorch, MLOps, AWS, GCP, Distributed Systems, Technical Leadership
Output: 92
</examples>

<rules>
- EMPTY or missing fields = 0 points for that category
- NEVER assume or infer data that isn't provided
- 1 field filled: max score 35
- 2 fields filled: max score 65
- All 3 filled: max score 100
- Generic/vague skills like "good communication" score lower than technical skills
${jobRequirements ? '- Score based on MATCH with job requirements, not just profile quality' : ''}
</rules>

<candidate>
Education: ${education?.trim() || 'EMPTY'}
Experience: ${experienceYears > 0 ? experienceYears + ' years' : 'EMPTY'}
Skills: ${skills?.trim() || 'EMPTY'}
</candidate>
${jobRequirements ? `\n<job>\n${jobRequirements}\n</job>` : ''}
Output ONLY a single integer 0-100:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    console.log('Gemini raw response:', text);

    let score = parseScore(text);

    score = Math.min(score, ceiling);

    console.log(`Final score: ${score} (ceiling: ${ceiling}, filled: ${filled}/3)`);
    return score;
  } catch (error) {
    console.error('Error scoring resume:', error);
    throw error;
  }
}

export async function scoreResumeForJob(
  candidateId: string,
  candidateName: string,
  education: string,
  experienceYears: number,
  skills: string,
  resumeUrl: string,
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string,
  minExperience: number
): Promise<number> {
  try {
    console.log(`Scoring ${candidateName} for ${jobTitle}`);

    const { isEmpty } = profileCompleteness(education, experienceYears, skills);
    if (isEmpty) {
      console.log('Empty profile, returning 0 for job match');
      return 0;
    }

    const jobRequirements = `Position: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${requiredSkills}
Min Experience: ${minExperience} years`;

    return await scoreResume(
      '',
      candidateName,
      education,
      experienceYears,
      skills,
      jobRequirements
    );
  } catch (error) {
    console.error('Error scoring resume for job:', error);
    throw error;
  }
}
