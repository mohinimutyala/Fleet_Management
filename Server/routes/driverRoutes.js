const express = require('express');
const router = express.Router();
const {
  registerDriver, loginDriver, getAllDrivers, getAvailableDrivers,
  getDriverProfile, toggleOnlineStatus, getEarnings, deleteDriver,
} = require('../controllers/driverController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.get('/all', protect, checkRole('admin'), getAllDrivers);
router.get('/available', protect, checkRole('admin'), getAvailableDrivers);
router.get('/profile', protect, checkRole('driver'), getDriverProfile);
router.put('/status', protect, checkRole('driver'), toggleOnlineStatus);
router.get('/earnings', protect, checkRole('driver'), getEarnings);
router.delete('/:id', protect, checkRole('admin'), deleteDriver);

module.exports = router;
