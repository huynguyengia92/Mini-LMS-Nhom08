const router = require('express').Router();
const ctrl = require('../controllers/vocabController');
const { authenticate, optionalAuth } = require('../middlewares/auth');

router.get('/sets', optionalAuth, ctrl.listSets);
router.get('/due-today', authenticate, ctrl.dueToday);
router.get('/sets/:id', optionalAuth, ctrl.getSet);
router.post('/words/:wordId/review', authenticate, ctrl.reviewWord);

module.exports = router;
