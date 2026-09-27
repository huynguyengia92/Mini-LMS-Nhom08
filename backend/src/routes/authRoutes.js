const router = require('express').Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;