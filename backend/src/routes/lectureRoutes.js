const router = require('express').Router();
const courseCtrl = require('../controllers/courseController');
const progressCtrl = require('../controllers/progressController');
const { authenticate, requireRole } = require('../middlewares/auth');

// UC3 — Xem bài giảng
router.get('/:id', authenticate, courseCtrl.getLecture);
router.post('/:id/complete', authenticate, requireRole('STUDENT'), progressCtrl.markLectureComplete);

// UC5 — Sửa/xóa bài giảng
router.put('/:id', authenticate, requireRole('INSTRUCTOR'), courseCtrl.updateLecture);
router.delete('/:id', authenticate, requireRole('INSTRUCTOR'), courseCtrl.deleteLecture);

module.exports = router;
