const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking', 'payment', 'ride', 'system'], default: 'system' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
