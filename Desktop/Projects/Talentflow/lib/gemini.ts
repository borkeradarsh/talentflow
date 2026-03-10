import { GoogleGenerativeAI } from '@google/generative-ai';

// SERVER-SIDE ONLY: This module should only be imported in API routes
const API_KEY = process.env.GEMINI_API_KEY || 'REDACTED_API_KEY';
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not found in environment variables, using hardcoded fallback');
}
const genAI = new GoogleGenerativeAI(API_KEY);

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
    console.log('API Key present:', API_KEY.substring(0, 10) + '...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an ATS (Applicant Tracking System) scoring engine. Analyze this candidate profile and provide a numerical score.

**CANDIDATE DATA:**
Name: ${candidateName}
Education: ${education || 'Not specified'}
Experience: ${experienceYears} years
Skills: ${skills || 'Not specified'}
Profile: ${resumeText}
${jobRequirements ? `\n**JOB REQUIREMENTS:**\n${jobRequirements}\n\n**Match the candidate's profile against these job requirements.**` : ''}

**SCORING SYSTEM (Total: 100 points):**
1. Resume Quality (25 pts): Clarity, structure, completeness
2. Skill Match (25 pts): ${jobRequirements ? 'How well skills align with job requirements' : 'Quality and relevance of skills'}
3. Experience Level (25 pts): Years of experience and career progression
4. Education Match (15 pts): Degree and educational background
5. Overall Fit (10 pts): Professional presentation

**CRITICAL RULES:**
- Output MUST be a single integer number between 0-100
- NO text, NO explanations, NO punctuation
- Just the number, for example: 75
- Be realistic: average candidates score 60-70, excellent ones 80-90
- Missing information should lower the score

Your response (number only):`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log('🔍 Gemini response:', text);
    
    // Extract number from response - try multiple patterns
    let score: number;
    
    // Try direct parseInt first
    score = parseInt(text);
    
    // If that fails, extract any digits
    if (isNaN(score)) {
      const matches = text.match(/\d+/);
      score = matches ? parseInt(matches[0]) : NaN;
    }
    
    // Validate score is between 0-100
    if (isNaN(score) || score < 0 || score > 100) {
      console.error('❌ Invalid score received from Gemini:', text);
      console.error('❌ Parsed as:', score);
      throw new Error(`Invalid score: ${text}`);
    }
    
    console.log('✅ Final score:', score);
    return score;
  } catch (error) {
    console.error('❌ Error scoring resume with Gemini:', error);
    throw error; // Re-throw instead of returning 50
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
    console.log(`🎯 Scoring ${candidateName} for ${jobTitle}`);
    
    const jobRequirements = `
POSITION: ${jobTitle}
DESCRIPTION: ${jobDescription}
REQUIRED SKILLS: ${requiredSkills}
MINIMUM EXPERIENCE: ${minExperience} years

Evaluate how well the candidate matches these specific job requirements.`;

    // Build a comprehensive resume text from available data
    const resumeText = `
PROFESSIONAL PROFILE:
${candidateName} is a professional with ${experienceYears} years of experience.

EDUCATION: ${education || 'Not specified'}

SKILLS & EXPERTISE:
${skills || 'Not specified'}

EXPERIENCE LEVEL: ${experienceYears} years
`;

    return await scoreResume(
      resumeText,
      candidateName,
      education,
      experienceYears,
      skills,
      jobRequirements
    );
  } catch (error) {
    console.error('❌ Error scoring resume for job:', error);
    throw error; // Re-throw instead of returning default
  }
}
