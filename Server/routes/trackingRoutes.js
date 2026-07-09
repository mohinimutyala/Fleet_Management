const express = require('express');
const router = express.Router();
const { updateTracking, getTracking } = require('../controllers/trackingController');
const { protect } = require('../middlewares/authMiddleware');

router.put('/:bookingId', protect, updateTracking);
router.get('/:bookingId', protect, getTracking);

module.exports = router;
