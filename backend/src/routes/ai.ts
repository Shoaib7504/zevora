import { Router } from 'express';
import { chatWithAgent, testAiConnection } from '../controllers/ai';

const router = Router();

// POST /api/ai/chat - Main AI shopping assistant
router.post('/chat', chatWithAgent);

// GET /api/ai/test - Verify Gemini connection (development helper)
router.get('/test', testAiConnection);

export default router;
