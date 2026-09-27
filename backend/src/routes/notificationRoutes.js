const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, ctrl.listNotifications);
router.get('/unread-count', authenticate, ctrl.unreadCount);

module.exports = router;
