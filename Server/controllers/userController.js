const bcrypt = require('bcryptjs');
const User = require('../models/UserSchema');
const generateToken = require('../utils/generateToken');

// @desc  Register user
// @route POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      token: generateToken(user._id, 'user'),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Login user
// @route POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      _id: user._id, name: user.name, email: user.email,
      token: generateToken(user._id, 'user'),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get user profile
// @route GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update user profile
// @route PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) user.password = await bcrypt.hash(req.body.password, 10);
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all users (admin)
// @route GET /api/users/all
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete user (admin)
// @route DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get user by ID (admin)
// @route GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update user by ID (admin)
// @route PUT /api/users/:id
const updateUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers, deleteUser, getUserById, updateUserById };
