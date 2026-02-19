import { getDB } from '../services/d1Service.js';

// Recursos por plan (ampliar en fases posteriores)
const RESOURCES = {
  downloads: {
    1: ['bot-basico-v1.zip'],
    2: ['bot-basico-v1.zip', 'bot-pro-v1.zip'],
    3: ['bot-basico-v1.zip', 'bot-pro-v1.zip', 'bot-elite-v1.zip'],
  },
  tutorials: {
    1: ['Introducción al bot'],
    2: ['Introducción al bot', 'Configuración avanzada'],
    3: ['Introducción al bot', 'Configuración avanzada', 'Estrategias exclusivas'],
  },
};

export async function getSummary(req, res, next) {
  try {
    const db   = getDB();
    const user = db.prepare(
      `SELECT u.id, u.email, u.name, u.plan_expires_at,
              p.name AS plan_name, p.price_usd
       FROM users u
       LEFT JOIN plans p ON p.id = u.plan_id
       WHERE u.id = ?`
    ).get(req.user.id);

    res.json({ summary: user });
  } catch (err) {
    next(err);
  }
}

export async function getDownloads(req, res, next) {
  try {
    const planId = req.user.planId;
    if (!planId) return res.status(403).json({ error: 'Sin plan activo' });

    const files = RESOURCES.downloads[planId] ?? [];
    res.json({ downloads: files });
  } catch (err) {
    next(err);
  }
}

export async function getTutorials(req, res, next) {
  try {
    const planId = req.user.planId;
    if (!planId) return res.status(403).json({ error: 'Sin plan activo' });

    const tutorials = RESOURCES.tutorials[planId] ?? [];
    res.json({ tutorials });
  } catch (err) {
    next(err);
  }
}
