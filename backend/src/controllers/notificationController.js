const Notification = require('../models/Notification');

async function listNotifications(req, res) {
  const notifications = await Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(30);
  const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  // Trả về trạng thái tại thời điểm đọc để giao diện tô đậm các thông báo vừa mới.
  res.json({ notifications, justReadIds: unreadIds });
}

async function unreadCount(req, res) {
  const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ count });
}

module.exports = { listNotifications, unreadCount };
