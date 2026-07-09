const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  licenseNo: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Available', 'Busy', 'Offline'],
    default: 'Available',
  },
  rating: { type: Number, default: 5.0 },
  totalEarnings: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  role: { type: String, default: 'driver' },
}, { timestamps: true });

const Driver = mongoose.model('Driver', DriverSchema);
module.exports = Driver;
