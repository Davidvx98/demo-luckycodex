import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getSummary,
  getDownloads,
  getTutorials,
} from '../controllers/dashboardController.js';

const router = Router();

// Todas las rutas del dashboard requieren sesión válida
router.use(requireAuth);

router.get('/summary',   getSummary);
router.get('/downloads', getDownloads);
router.get('/tutorials', getTutorials);

export default router;
