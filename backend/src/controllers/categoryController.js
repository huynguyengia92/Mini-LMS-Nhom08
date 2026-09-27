const Category = require('../models/Category');
const Course = require('../models/Course');

// UC8 — Quản lý danh mục khóa học
async function listCategories(req, res) {
  const categories = await Category.find().sort('name');
  res.json({ categories });
}

async function createCategory(req, res) {
  const { name, description } = req.body;
  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: 'Danh mục đã tồn tại.' });
  const category = await Category.create({ name, description });
  res.status(201).json({ category });
}

async function updateCategory(req, res) {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
  res.json({ category });
}

async function deleteCategory(req, res) {
  const inUse = await Course.exists({ category: req.params.id });
  if (inUse) return res.status(400).json({ message: 'Không thể xóa: vẫn còn khóa học thuộc danh mục này.' });
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
  res.json({ message: 'Đã xóa danh mục.' });
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
