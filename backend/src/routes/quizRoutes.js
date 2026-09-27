const router = require('express').Router();
const ctrl = require('../controllers/quizController');
const { authenticate, optionalAuth, requireRole } = require('../middlewares/auth');

// Thư viện đề TOEIC (UC2/UC4 — mở rộng cho luyện thi)
router.get('/toeic/tests', optionalAuth, ctrl.listToeicTests);
router.get('/toeic/tests/:id', optionalAuth, ctrl.getToeicTest);

// UC6 — Giảng viên soạn đề (Factory Method)
router.get('/:id/manage', authenticate, requireRole('INSTRUCTOR'), ctrl.getQuizForManage);
router.post('/:id/questions', authenticate, requireRole('INSTRUCTOR'), ctrl.addQuestion);
router.delete('/questions/:id', authenticate, requireRole('INSTRUCTOR'), ctrl.deleteQuestion);
router.delete('/:id', authenticate, requireRole('INSTRUCTOR'), ctrl.deleteQuiz);

// UC4 — Học viên làm bài (Template Method + Strategy)
router.post('/:id/start', authenticate, requireRole('STUDENT'), ctrl.startAttempt);
router.get('/attempts/:id', authenticate, requireRole('STUDENT'), ctrl.getAttempt);
router.post('/attempts/:id/submit', authenticate, requireRole('STUDENT'), ctrl.submitAttempt);
router.get('/attempts/:id/result', authenticate, requireRole('STUDENT'), ctrl.getResult);

module.exports = router;
