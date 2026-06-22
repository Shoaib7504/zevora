import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('[Gemini Error]: GEMINI_API_KEY is not set in .env file.');
} else if (!apiKey.startsWith('AIza') && !apiKey.startsWith('AQ.')) {
  console.warn('[Gemini Warning]: GEMINI_API_KEY does not start with standard prefixes ("AIza" or "AQ."). It might be invalid.');
} else {
  console.log('[Gemini]: API key loaded successfully.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Use gemini-1.5-flash (fast, free tier available)
const model = genAI.getGenerativeModel(
  {
    model: 'gemini-2.5-flash',
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  },
  { apiVersion: 'v1' }
);

/**
 * Token bucket rate limiter — 15 requests per minute (free tier safe)
 */
export class TokenBucketRateLimiter {
  private capacity: number;
  private tokens: number;
  private lastRefill: number;
  private refillRate: number;

  constructor(limitPerMinute: number) {
    this.capacity = limitPerMinute;
    this.tokens = limitPerMinute;
    this.lastRefill = Date.now();
    this.refillRate = limitPerMinute / (60 * 1000);
  }

  private refill() {
    const now = Date.now();
    const delta = now - this.lastRefill;
    this.tokens = Math.min(this.capacity, this.tokens + delta * this.refillRate);
    this.lastRefill = now;
  }

  public acquire(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

export const aiRateLimiter = new TokenBucketRateLimiter(15);

/**
 * Exponential backoff retry wrapper
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;
    // Don't retry on auth errors (bad API key)
    if (error?.status === 400 || error?.status === 401 || error?.status === 403) {
      throw error;
    }
    console.warn(`[Gemini]: Retrying in ${delay}ms... (${retries} left). Error: ${error?.message}`);
    await new Promise((r) => setTimeout(r, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * Generate text using Gemini Flash
 */
export async function generateText(prompt: string): Promise<string> {
  // Rate limit check
  const allowed = aiRateLimiter.acquire();
  if (!allowed) {
    throw new Error('Rate limit reached. Please wait a moment before sending more queries.');
  }

  if (!apiKey || (!apiKey.startsWith('AIza') && !apiKey.startsWith('AQ.'))) {
    throw new Error(
      'GEMINI_API_KEY is missing or invalid. Please set a valid key in backend/.env starting with "AIza" or "AQ.". ' +
      'Get a free key at: https://aistudio.google.com/app/apikey'
    );
  }

  return withRetry(async () => {
    console.log('[Gemini]: Sending request...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text || text.trim() === '') {
      throw new Error('Gemini returned an empty response.');
    }
    console.log('[Gemini]: Response received successfully.');
    return text;
  });
}
