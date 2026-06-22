import { Router } from 'express';
import { getAnalyticsSummary } from '../controllers/analytics';
import requireRole from '../middlewares/auth';

const router = Router();

// GET /analytics - Get aggregated charts data (requires admin or manager roles)
router.get('/', requireRole(['admin', 'manager']), getAnalyticsSummary);

export default router;
