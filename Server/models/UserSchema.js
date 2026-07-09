const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  role: { type: String, default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;
