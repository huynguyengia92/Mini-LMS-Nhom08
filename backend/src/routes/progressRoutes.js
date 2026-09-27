const router = require('express').Router();
const ctrl = require('../controllers/progressController');
const { authenticate, requireRole } = require('../middlewares/auth');

// UC7 — Theo dõi tiến độ học tập
router.get('/', authenticate, requireRole('STUDENT'), ctrl.progressOverview);

module.exports = router;
