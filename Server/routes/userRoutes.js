const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, getUserProfile, updateUserProfile,
  getAllUsers, deleteUser, getUserById, updateUserById,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/all', protect, checkRole('admin'), getAllUsers);
router.get('/:id', protect, checkRole('admin'), getUserById);
router.put('/:id', protect, checkRole('admin'), updateUserById);
router.delete('/:id', protect, checkRole('admin'), deleteUser);

module.exports = router;
