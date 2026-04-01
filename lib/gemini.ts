import { GoogleGenerativeAI, SchemaType as Type } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
if (!API_KEY) {
  console.warn('GEMINI_API_KEY not found. API calls will fail unless provided.');
}
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AtsScoreResult {
  isResumeValid: boolean;
  reasoning: string;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  impactScore: number;
  totalScore: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toSafeInt(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.round(parsed);
  }
  return fallback;
}

function countSkills(skillsSummary: string): number {
  if (!skillsSummary?.trim()) return 0;
  return skillsSummary
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function scoreResumeFallback(
  resumeText: string,
  educationSummary: string,
  experienceYearsSummary: number,
  skillsSummary: string,
): number {
  const normalizedTextLen = (resumeText || '').trim().length;
  const hasEducation = !!educationSummary?.trim();
  const experienceYears = Math.max(0, experienceYearsSummary || 0);
  const skillsCount = countSkills(skillsSummary);

  const textQuality = clamp(Math.round((Math.min(normalizedTextLen, 4000) / 4000) * 35), 5, 35);
  const experienceScore = clamp(Math.round((Math.min(experienceYears, 10) / 10) * 30), 0, 30);
  const skillsScore = clamp(Math.round((Math.min(skillsCount, 12) / 12) * 25), 0, 25);
  const educationScore = hasEducation ? 10 : 0;

  return clamp(textQuality + experienceScore + skillsScore + educationScore, 0, 100);
}

/**
 * Validates if the input looks like a valid document before sending to the API.
 */
function isValidDocument(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  // Keep this permissive because some workflows pass condensed profile summaries.
  if (text.trim().length < 20) return false;
  return true;
}

/**
 * Core scoring engine that uses Gemini to strictly evaluate a resume against job requirements.
 */
export async function scoreResume(
  resumeText: string,
  candidateName: string,
  educationSummary: string,
  experienceYearsSummary: number,
  skillsSummary: string,
  jobRequirements: string
): Promise<number> {
  try {
    console.log(`Analyzing resume for candidate: ${candidateName}`);

    const normalizedResumeText = (resumeText || '').trim();
    const fallbackSummary = [
      `Candidate: ${candidateName || 'Unknown'}`,
      `Education: ${educationSummary || 'Not specified'}`,
      `Experience: ${experienceYearsSummary > 0 ? `${experienceYearsSummary} years` : 'Not specified'}`,
      `Skills: ${skillsSummary || 'Not specified'}`,
    ].join('\n');

    const scoringText = normalizedResumeText.length >= 20 ? normalizedResumeText : fallbackSummary;

    // 1. Pre-flight check: Did the user actually upload a valid document?
    if (!isValidDocument(scoringText)) {
      console.warn(`[Reject] Resume text for ${candidateName} is missing, empty, or too short.`);
      return 0; // Automatic 0 if no real document is provided
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isResumeValid: { 
              type: Type.BOOLEAN, 
              description: "True if the text appears to be a real resume or CV. False if it is gibberish, an empty file, or completely unrelated to a job application." 
            },
            reasoning: { 
              type: Type.STRING, 
              description: "Step-by-step critical evaluation of the candidate's resume strictly against the provided job requirements. Highlight missing required skills or experience gaps." 
            },
            skillsScore: { type: Type.INTEGER, description: "Score from 0 to 40 based on strict matching of required technical and soft skills." },
            experienceScore: { type: Type.INTEGER, description: "Score from 0 to 30 based on matching the required years of experience and relevance of past roles." },
            educationScore: { type: Type.INTEGER, description: "Score from 0 to 20 based on meeting educational or certification requirements." },
            impactScore: { type: Type.INTEGER, description: "Score from 0 to 10 based on measurable achievements, clarity, and overall professional presentation of the resume." },
            totalScore: { type: Type.INTEGER, description: "The sum of skillsScore, experienceScore, educationScore, and impactScore. Maximum is 100." }
          },
          required: ["isResumeValid", "reasoning", "skillsScore", "experienceScore", "educationScore", "impactScore", "totalScore"]
        }
      }
    });

    const prompt = `
      You are an enterprise-grade Applicant Tracking System (ATS).
      Your task is to evaluate a candidate's resume against job requirements in a balanced, consistent way.
      
      SCORING RUBRIC (Max 100 Points):
      1. Skills Match (0-40 points): Check required skills with reasonable allowance for equivalent tools or adjacent technologies.
      2. Experience Match (0-30 points): Compare years and role relevance; partial matches should receive partial credit.
      3. Education Match (0-20 points): Score degree/certification fit, but do not over-penalize strong practical experience.
      4. Impact & Quality (0-10 points): Reward measurable outcomes and clarity.
      
      RULES:
      - Be consistent and fair. If evidence is partial but relevant, assign partial credit.
      - If the document is clearly not a resume (e.g., blank text, spam, unrelated content), set "isResumeValid" to false.
      - Avoid extreme score swings for small wording differences.
      - Base your primary analysis on the <resume_text>. The summary data is just for quick reference.

      --- JOB REQUIREMENTS ---
      ${jobRequirements || 'Standard professional requirements apply.'}

      --- CANDIDATE SUMMARY DATA ---
      Name: ${candidateName}
      Provided Education: ${educationSummary || 'Not specified'}
      Provided Experience: ${experienceYearsSummary > 0 ? experienceYearsSummary + ' years' : 'Not specified'}
      Provided Skills: ${skillsSummary || 'Not specified'}

      --- ACTUAL RESUME TEXT ---
      ${scoringText}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the structured JSON response
    const evaluation: AtsScoreResult = JSON.parse(responseText);
    
    console.log(`[Gemini Reasoning]: ${evaluation.reasoning}`);

    // 2. AI Validation: If the AI determines the document isn't a resume, reject it.
    if (!evaluation.isResumeValid) {
      if (scoringText.length < 200) {
        console.warn(`[Reject] AI determined the document for ${candidateName} is not a valid resume.`);
        return 0;
      }
      console.warn(`[Warn] AI flagged resume validity for ${candidateName}, but text is substantial; proceeding with conservative scoring.`);
    }

    const skillsScore = clamp(toSafeInt(evaluation.skillsScore), 0, 40);
    const experienceScore = clamp(toSafeInt(evaluation.experienceScore), 0, 30);
    const educationScore = clamp(toSafeInt(evaluation.educationScore), 0, 20);
    const impactScore = clamp(toSafeInt(evaluation.impactScore), 0, 10);
    const computedTotal = skillsScore + experienceScore + educationScore + impactScore;

    // Ensure the score is capped correctly between 0 and 100.
    const finalScore = clamp(computedTotal, 0, 100);
    
    console.log(`[Final Score]: ${finalScore}/100 for ${candidateName}`);
    return finalScore;

  } catch (error) {
    console.error(`Error scoring resume for ${candidateName}:`, error);

    const fallback = scoreResumeFallback(
      resumeText,
      educationSummary,
      experienceYearsSummary,
      skillsSummary,
    );
    console.warn(`[Fallback Score]: ${fallback}/100 for ${candidateName}`);
    return fallback;
  }
}

/**
 * Wrapper function to format job parameters and call the main scoring engine.
 */
export async function scoreResumeForJob(
  candidateId: string,
  candidateName: string,
  education: string,
  experienceYears: number,
  skills: string,
  resumeUrl: string,
  resumeText: string, // <-- Added: You MUST pass the actual extracted resume text here
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string,
  minExperience: number
): Promise<number> {
  try {
    console.log(`Initiating scoring: ${candidateName} applied for ${jobTitle}`);

    const jobRequirements = `
      Position Title: ${jobTitle}
      Minimum Experience Required: ${minExperience} years
      Required Core Skills: ${requiredSkills}
      
      Full Job Description:
      ${jobDescription}
    `;

    return await scoreResume(
      resumeText, // Now passing the actual text instead of ''
      candidateName,
      education,
      experienceYears,
      skills,
      jobRequirements
    );
  } catch (error) {
    console.error(`Error in scoreResumeForJob for candidate ${candidateId}:`, error);
    throw error;
  }
}