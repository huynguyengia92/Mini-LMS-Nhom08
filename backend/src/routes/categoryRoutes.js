const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { authenticate, requireRole } = require('../middlewares/auth');

// UC8 — Quản lý danh mục (Quản trị)
router.get('/', ctrl.listCategories);
router.post('/', authenticate, requireRole('ADMIN'), ctrl.createCategory);
router.put('/:id', authenticate, requireRole('ADMIN'), ctrl.updateCategory);
router.delete('/:id', authenticate, requireRole('ADMIN'), ctrl.deleteCategory);

module.exports = router;
