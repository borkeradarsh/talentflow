import mammoth from 'mammoth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'node:module';

type PdfParseResult = { text?: string };
type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js') as PdfParseFn;

async function extractPdfTextWithGemini(buffer: Buffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return '';
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: buffer.toString('base64'),
        },
      },
      {
        text: 'Extract the complete text from this resume PDF. Return plain text only, preserving section order where possible.',
      },
    ]);

    return result.response.text() || '';
  } catch (error) {
    console.error('Gemini PDF extraction fallback failed:', error);
    return '';
  }
}

function normalizeText(input: string): string {
  return input.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function inferFileType(contentType: string | null, url: string): 'pdf' | 'docx' | 'txt' | 'unknown' {
  const safeContentType = (contentType || '').toLowerCase();
  let safePath = url.toLowerCase();

  try {
    safePath = new URL(url).pathname.toLowerCase();
  } catch {
    // Keep raw URL fallback for malformed values.
  }

  if (safeContentType.includes('application/pdf') || safePath.endsWith('.pdf')) return 'pdf';
  if (
    safeContentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
    safePath.endsWith('.docx')
  ) {
    return 'docx';
  }
  if (safeContentType.startsWith('text/') || safePath.endsWith('.txt')) return 'txt';

  return 'unknown';
}

function detectFileTypeBySignature(buffer: Buffer): 'pdf' | 'docx' | 'txt' | 'unknown' {
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'pdf';
  }

  if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
    return 'docx';
  }

  return 'unknown';
}

async function parseBufferByType(buffer: Buffer, fileType: 'pdf' | 'docx' | 'txt' | 'unknown'): Promise<string> {
  if (fileType === 'pdf') {
    try {
      const result = await pdfParse(buffer);
      return result.text || '';
    } catch (error) {
      console.error('PDF extraction failed in local parser:', error);
      return await extractPdfTextWithGemini(buffer);
    }
  }

  if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  if (fileType === 'txt') {
    return buffer.toString('utf-8');
  }

  // Never pass binary data as text to scoring.
  return '';
}

export async function extractResumeTextFromUrl(resumeUrl: string): Promise<string> {
  if (!resumeUrl?.trim()) return '';

  try {
    const response = await fetch(resumeUrl, { redirect: 'follow' });
    if (!response.ok) {
      console.warn(`Could not fetch resume: ${response.status} ${response.statusText}`);
      return '';
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const byHeaderOrPath = inferFileType(response.headers.get('content-type'), resumeUrl);
    const bySignature = detectFileTypeBySignature(buffer);
    const fileType = byHeaderOrPath !== 'unknown' ? byHeaderOrPath : bySignature;
    const extracted = await parseBufferByType(buffer, fileType);

    return normalizeText(extracted);
  } catch (error) {
    console.error('Resume extraction failed:', error);
    return '';
  }
}
