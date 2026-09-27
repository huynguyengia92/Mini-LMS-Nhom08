const router = require('express').Router();
const ctrl = require('../controllers/courseController');
const quizCtrl = require('../controllers/quizController');
const { authenticate, optionalAuth, requireRole } = require('../middlewares/auth');

// Public / student browsing (UC2, UC3)
router.get('/', optionalAuth, ctrl.listCourses);
router.get('/:slug', optionalAuth, ctrl.getCourse);
router.post('/:slug/enroll', authenticate, ctrl.enroll);

// Instructor management (UC5)
router.get('/instructor/mine', authenticate, requireRole('INSTRUCTOR'), ctrl.myCourses);
router.post('/', authenticate, requireRole('INSTRUCTOR'), ctrl.createCourse);
router.put('/:slug', authenticate, requireRole('INSTRUCTOR'), ctrl.updateCourse);
router.delete('/:slug', authenticate, requireRole('INSTRUCTOR'), ctrl.deleteCourse);

router.post('/:slug/lectures', authenticate, requireRole('INSTRUCTOR'), ctrl.createLecture);
router.post('/:slug/quizzes', authenticate, requireRole('INSTRUCTOR'), quizCtrl.createQuiz);

module.exports = router;
