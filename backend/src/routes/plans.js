import { Router } from 'express';
import { getPlans } from '../controllers/plansController.js';

const router = Router();

// Ruta pública — los planes se muestran en la landing
router.get('/', getPlans);

export default router;
