const bcrypt = require('bcryptjs');
const Admin = require('../models/AdminSchema');
const User = require('../models/UserSchema');
const Car = require('../models/CarSchema');
const Booking = require('../models/MyBookingSchema');
const Driver = require('../models/DriverSchema');
const generateToken = require('../utils/generateToken');

// @desc  Register admin
// @route POST /api/admin/register
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashed });
    res.status(201).json({
      _id: admin._id, name: admin.name, email: admin.email,
      token: generateToken(admin._id, 'admin'),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Login admin
// @route POST /api/admin/login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({
      _id: admin._id, name: admin.name, email: admin.email,
      token: generateToken(admin._id, 'admin'),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get dashboard stats (expanded)
// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      users, totalCabs, totalBookings, totalDrivers,
      availableVehicles, bookedVehicles, maintenanceVehicles,
      availableDrivers, busyDrivers,
      pendingBookings, completedBookings,
    ] = await Promise.all([
      User.countDocuments(),
      Car.countDocuments(),
      Booking.countDocuments(),
      Driver.countDocuments(),
      Car.countDocuments({ vehicleStatus: 'Available' }),
      Car.countDocuments({ vehicleStatus: 'Booked' }),
      Car.countDocuments({ vehicleStatus: 'Maintenance' }),
      Driver.countDocuments({ status: 'Available' }),
      Driver.countDocuments({ status: 'Busy' }),
      Booking.countDocuments({ bookingStatus: 'Pending' }),
      Booking.find({ bookingStatus: 'Completed' }),
    ]);

    const todayBookingsCount = await Booking.countDocuments({ createdAt: { $gte: today } });

    // === Financial Calculations ===
    // All-time
    const grossRevenue     = completedBookings.reduce((s, b) => s + (parseFloat(b.fare) || 0), 0);
    const platformRevenue  = completedBookings.reduce((s, b) => s + (b.platformRevenue || 0), 0);
    const driverPayout     = completedBookings.reduce((s, b) => s + (b.driverCommission || 0), 0);

    // Today
    const todayCompleted = await Booking.find({ bookingStatus: 'Completed', updatedAt: { $gte: today } });
    const todayGross     = todayCompleted.reduce((s, b) => s + (parseFloat(b.fare) || 0), 0);
    const todayPlatform  = todayCompleted.reduce((s, b) => s + (b.platformRevenue || 0), 0);
    const todayPayout    = todayCompleted.reduce((s, b) => s + (b.driverCommission || 0), 0);

    // This month
    const monthlyCompleted = await Booking.find({ bookingStatus: 'Completed', updatedAt: { $gte: startOfMonth } });
    const monthlyGross     = monthlyCompleted.reduce((s, b) => s + (parseFloat(b.fare) || 0), 0);
    const monthlyPlatform  = monthlyCompleted.reduce((s, b) => s + (b.platformRevenue || 0), 0);
    const monthlyPayout    = monthlyCompleted.reduce((s, b) => s + (b.driverCommission || 0), 0);

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);

    const monthlyData = await Booking.aggregate([
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    res.json({
      users, cabs: totalCabs, bookings: totalBookings, drivers: totalDrivers,
      availableVehicles, bookedVehicles, maintenanceVehicles,
      availableDrivers, busyDrivers,
      pendingBookings, completedTrips: completedBookings.length,
      todayBookings: todayBookingsCount,
      // Financial breakdown
      grossRevenue, platformRevenue, driverPayout,
      todayGross, todayPlatform, todayPayout,
      monthlyGross, monthlyPlatform, monthlyPayout,
      // Legacy aliases (keep existing code from breaking)
      totalRevenue: grossRevenue,
      todayRevenue: todayGross,
      monthlyRevenue: monthlyGross,
      recentBookings, monthlyData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get reports (vehicle utilization, most booked, most active driver)
// @route GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    // Most booked vehicles
    const vehicleUtilization = await Booking.aggregate([
      { $match: { carId: { $exists: true, $ne: null } } },
      { $group: { _id: '$carId', count: { $sum: 1 }, totalRevenue: { $sum: { $toDouble: '$fare' } }, carname: { $first: '$carname' }, cartype: { $first: '$cartype' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Most active drivers
    const driverActivity = await Booking.aggregate([
      { $match: { driverId: { $exists: true, $ne: null }, bookingStatus: 'Completed' } },
      { $group: { _id: '$driverId', completedTrips: { $sum: 1 }, totalRevenue: { $sum: { $toDouble: '$fare' } }, drivername: { $first: '$drivername' } } },
      { $sort: { completedTrips: -1 } },
      { $limit: 10 },
    ]);

    // Monthly bookings breakdown
    const monthlyBookings = await Booking.aggregate([
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'Completed'] }, 1, 0] } },
        revenue: { $sum: { $toDouble: '$fare' } },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ vehicleUtilization, driverActivity, monthlyBookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get admin profile
// @route GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerAdmin, loginAdmin, getDashboardStats, getAdminProfile, getReports };