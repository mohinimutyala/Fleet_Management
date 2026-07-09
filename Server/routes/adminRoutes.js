const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getDashboardStats, getAdminProfile, getReports } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/dashboard', protect, checkRole('admin'), getDashboardStats);
router.get('/profile', protect, checkRole('admin'), getAdminProfile);
router.get('/reports', protect, checkRole('admin'), getReports);

module.exports = router;
