const bcrypt = require('bcryptjs');
const Driver = require('../models/DriverSchema');
const Booking = require('../models/MyBookingSchema');
const generateToken = require('../utils/generateToken');

// @desc  Register driver
// @route POST /api/drivers/register
const registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone, licenseNo } = req.body;
    const exists = await Driver.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Driver already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const driver = await Driver.create({ name, email, password: hashed, phone, licenseNo, status: 'Available' });
    res.status(201).json({
      _id: driver._id, name: driver.name, email: driver.email,
      token: generateToken(driver._id, 'driver'),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Login driver
// @route POST /api/drivers/login
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, driver.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({
      _id: driver._id, name: driver.name, email: driver.email,
      isOnline: driver.isOnline, status: driver.status,
      token: generateToken(driver._id, 'driver'),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all drivers (admin)
// @route GET /api/drivers/all
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get available drivers (admin — for assign driver dropdown)
// @route GET /api/drivers/available
const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: 'Available' }).select('-password');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get driver profile
// @route GET /api/drivers/profile
const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Toggle online/offline status
// @route PUT /api/drivers/status
const toggleOnlineStatus = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id);
    driver.isOnline = !driver.isOnline;
    // Sync status field: if going offline and not busy, mark Offline
    if (!driver.isOnline && driver.status !== 'Busy') {
      driver.status = 'Offline';
    } else if (driver.isOnline && driver.status === 'Offline') {
      driver.status = 'Available';
    }
    await driver.save();
    res.json({ isOnline: driver.isOnline, status: driver.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get driver earnings (with today + monthly calculated from bookings)
// @route GET /api/drivers/earnings
const getEarnings = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id).select('totalEarnings totalRides name status');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // All completed rides
    const allCompleted = await Booking.find({ driverId: req.user.id, bookingStatus: 'Completed' })
      .sort({ updatedAt: -1 });

    // Today's completed
    const todayRides = allCompleted.filter(b => new Date(b.updatedAt) >= today);
    const todayRevenue = todayRides.reduce((sum, b) => sum + (parseFloat(b.fare) || 0), 0);

    // Monthly completed
    const monthlyRides = allCompleted.filter(b => new Date(b.updatedAt) >= startOfMonth);
    const monthlyRevenue = monthlyRides.reduce((sum, b) => sum + (parseFloat(b.fare) || 0), 0);

    const totalRevenue = allCompleted.reduce((sum, b) => sum + (parseFloat(b.fare) || 0), 0);

    res.json({
      totalEarnings: driver.totalEarnings || 0,
      totalRides: driver.totalRides || 0,
      todayRevenue,
      todayRides: todayRides.length,
      monthlyRevenue,
      monthlyRides: monthlyRides.length,
      recentRides: allCompleted.slice(0, 10),
      status: driver.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete driver (admin)
// @route DELETE /api/drivers/:id
const deleteDriver = async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerDriver, loginDriver, getAllDrivers, getAvailableDrivers,
  getDriverProfile, toggleOnlineStatus, getEarnings, deleteDriver,
};
