import { Request, Response } from 'express';
import { executeAgentFlow } from '../services/agent';
import { generateText } from '../services/gemini';

/**
 * POST /api/ai/chat
 * Main AI shopping assistant endpoint
 */
export async function chatWithAgent(req: Request, res: Response): Promise<void> {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({
        success: false,
        message: 'A valid text "message" is required in the request body.',
      });
      return;
    }

    if (message.trim().length > 1000) {
      res.status(400).json({
        success: false,
        message: 'Message too long. Please keep it under 1000 characters.',
      });
      return;
    }

    console.log(`[AI Chat]: Processing query: "${message.slice(0, 80)}..."`);
    const agentResponse = await executeAgentFlow(message.trim());

    res.status(200).json({
      success: true,
      data: agentResponse,
    });
  } catch (error: any) {
    console.error('[AI Controller Error]:', error?.message || error);

    // Provide user-friendly error messages
    let userMessage = 'An error occurred while processing your request.';
    const errMsg = error?.message || '';

    if (errMsg.includes('GEMINI_API_KEY') || errMsg.includes('invalid') || errMsg.includes('API key')) {
      userMessage = 'The AI service is not configured. The administrator needs to set a valid GEMINI_API_KEY in the backend environment.';
    } else if (errMsg.includes('Rate limit') || errMsg.includes('429')) {
      userMessage = 'Too many requests. Please wait a moment before trying again.';
    } else if (errMsg.includes('quota') || errMsg.includes('QUOTA')) {
      userMessage = 'AI quota exceeded for today. Please try again tomorrow or upgrade your API plan.';
    } else if (errMsg.includes('empty response')) {
      userMessage = 'The AI returned an empty response. Please rephrase your question.';
    }

    res.status(500).json({
      success: false,
      error: userMessage,
      detail: process.env.NODE_ENV === 'development' ? errMsg : undefined,
    });
  }
}

/**
 * GET /api/ai/test
 * Quick health check to verify Gemini connection works
 */
export async function testAiConnection(req: Request, res: Response): Promise<void> {
  try {
    const result = await generateText('Say "Zevora AI is online!" and nothing else.');
    res.status(200).json({
      success: true,
      message: 'Gemini AI connection is working!',
      response: result.trim(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gemini AI connection failed.',
      error: error?.message || 'Unknown error',
      fix: 'Please set a valid GEMINI_API_KEY in backend/.env. Get a free key at https://aistudio.google.com/app/apikey',
    });
  }
}
