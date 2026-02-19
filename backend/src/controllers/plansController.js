import { getDB } from '../services/d1Service.js';

export async function getPlans(_req, res, next) {
  try {
    const db    = getDB();
    const plans = db.prepare('SELECT * FROM plans WHERE is_active = 1').all();
    res.json({ plans });
  } catch (err) {
    next(err);
  }
}
