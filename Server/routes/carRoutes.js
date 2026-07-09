const express = require('express');
const router = express.Router();
const { getCars, getCarById, addCar, updateCar, deleteCar } = require('../controllers/carController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/multer');

router.get('/', getCars);
router.get('/:id', getCarById);
router.post('/', protect, checkRole('admin'), upload.single('carImage'), addCar);
router.put('/:id', protect, checkRole('admin'), upload.single('carImage'), updateCar);
router.delete('/:id', protect, checkRole('admin'), deleteCar);

module.exports = router;
