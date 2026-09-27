const router = require('express').Router();
const ctrl = require('../controllers/dictationController');
const { authenticate, optionalAuth } = require('../middlewares/auth');

router.get('/lessons', optionalAuth, ctrl.listLessons);
router.get('/lessons/:id', optionalAuth, ctrl.getLesson);
router.post('/segments/:segmentId/check', authenticate, ctrl.checkSegment);
router.post('/segments/:segmentId/reveal', authenticate, ctrl.revealSegment);

module.exports = router;
