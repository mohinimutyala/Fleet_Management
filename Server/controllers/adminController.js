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

// ── Helper: today's UTC window aligned to IST (UTC+5:30) ─────────────────────
// MongoDB stores all dates in UTC. The app runs in India (IST = UTC+5:30).
// We compute today midnight IST explicitly so the query always covers the
// correct 24-hour window regardless of the Node.js process timezone setting.
function getTodayRangeUTC() {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes
  const nowUTC = Date.now();
  // Milliseconds since epoch at midnight IST today
  const todayMidnightIST_ms =
    Math.floor((nowUTC + IST_OFFSET_MS) / 86_400_000) * 86_400_000 - IST_OFFSET_MS;
  const todayStart = new Date(todayMidnightIST_ms);
  const todayEnd   = new Date(todayMidnightIST_ms + 86_400_000 - 1); // 23:59:59.999 IST
  return { todayStart, todayEnd };
}

// @desc  Get dashboard stats (ERP dashboard)
// @route GET /api/admin/dashboard
//
// DESIGN: Each section has its own try/catch so a single failing query never
// blanks the entire response. Partial data is always returned.
const getDashboardStats = async (req, res) => {
  try {
    const now   = new Date();
    const { todayStart, todayEnd } = getTodayRangeUTC();

    const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── SECTION 1: Core counts ────────────────────────────────────────────
    // Exact enum values from schemas:
    //   Driver.status   → 'Available' | 'Busy' | 'Offline'
    //   Car.vehicleStatus → 'Available' | 'Booked' | 'Maintenance'
    const [
      totalUsers, totalCabs, totalDrivers, totalBookings,
      availableVehicles, bookedVehicles, maintenanceVehicles,
      availableDrivers, busyDrivers, offlineDrivers,
    ] = await Promise.all([
      User.countDocuments(),
      Car.countDocuments(),
      Driver.countDocuments(),
      Booking.countDocuments(),
      Car.countDocuments({ vehicleStatus: 'Available' }),
      Car.countDocuments({ vehicleStatus: 'Booked' }),
      Car.countDocuments({ vehicleStatus: 'Maintenance' }),
      Driver.countDocuments({ status: 'Available' }),
      Driver.countDocuments({ status: 'Busy' }),
      Driver.countDocuments({ status: 'Offline' }),
    ]);

    // ── SECTION 2: Booking status breakdown ──────────────────────────────
    // Use a single aggregation that groups by bookingStatus — returns exact
    // stored string values so there is no case-mismatch risk.
    let pendingBookings = 0, confirmedBookings = 0, completedBookings = 0,
        cancelledBookings = 0, inProgressBookings = 0;
    try {
      // Aggregate all statuses in one query
      const statusAgg = await Booking.aggregate([
        {
          $group: {
            _id: '$bookingStatus',   // exact stored value
            count: { $sum: 1 },
          },
        },
      ]);

      // Build a lookup map; handle null/_id gracefully
      const byStatus = {};
      statusAgg.forEach(row => {
        if (row._id != null) byStatus[row._id] = row.count;
      });

      pendingBookings   = byStatus['Pending']   || 0;
      confirmedBookings = byStatus['Confirmed'] || 0;
      completedBookings = byStatus['Completed'] || 0;
      cancelledBookings = byStatus['Cancelled'] || 0;

      // "In Progress" = Confirmed bookings whose trip has physically started
      inProgressBookings = await Booking.countDocuments({
        bookingStatus: 'Confirmed',
        tripStatus: 'Started',
      });
    } catch (e) {
      console.error('[Dashboard §2 booking status]', e.message);
    }

    // ── SECTION 3: Financial aggregations ────────────────────────────────
    let grossRevenue = 0, platformRevenue = 0, driverPayout = 0;
    let todayGross = 0, todayPlatform = 0, todayPayout = 0;
    let weeklyGross = 0, weeklyPlatform = 0, weeklyPayout = 0;
    let monthlyGross = 0, monthlyPlatform = 0, monthlyPayout = 0;
    let pendingPaymentsCount = 0, refundsCount = 0;
    try {
      const buildFinPipeline = (matchExtra = {}) => ([
        { $match: { bookingStatus: 'Completed', ...matchExtra } },
        { $group: {
          _id: null,
          gross:    { $sum: { $toDouble: { $ifNull: ['$fare', '0'] } } },
          platform: { $sum: { $ifNull: ['$platformRevenue', 0] } },
          payout:   { $sum: { $ifNull: ['$driverCommission', 0] } },
        }},
      ]);

      const [overall, todayFin, weekFin, monthFin, pendPay, refunds] = await Promise.all([
        Booking.aggregate(buildFinPipeline()),
        Booking.aggregate(buildFinPipeline({ updatedAt: { $gte: todayStart, $lte: todayEnd } })),
        Booking.aggregate(buildFinPipeline({ updatedAt: { $gte: weekStart } })),
        Booking.aggregate(buildFinPipeline({ updatedAt: { $gte: monthStart } })),
        Booking.countDocuments({ bookingStatus: 'Completed', paymentStatus: 'Pending' }),
        Booking.countDocuments({ paymentStatus: 'Refunded' }),
      ]);

      if (overall[0])  { grossRevenue = overall[0].gross; platformRevenue = overall[0].platform; driverPayout = overall[0].payout; }
      if (todayFin[0]) { todayGross   = todayFin[0].gross;  todayPlatform   = todayFin[0].platform;  todayPayout   = todayFin[0].payout; }
      if (weekFin[0])  { weeklyGross  = weekFin[0].gross;   weeklyPlatform  = weekFin[0].platform;   weeklyPayout  = weekFin[0].payout; }
      if (monthFin[0]) { monthlyGross = monthFin[0].gross;  monthlyPlatform = monthFin[0].platform;  monthlyPayout = monthFin[0].payout; }
      pendingPaymentsCount = pendPay;
      refundsCount         = refunds;
    } catch (e) {
      console.error('[Dashboard §3 financials]', e.message);
    }

    // ── SECTION 4: Today's activity ──────────────────────────────────────
    // Uses explicit IST-aligned UTC window from getTodayRangeUTC() above.
    // This is timezone-safe even if the Node.js process runs in UTC.
    let newBookingsToday = 0, tripsStartedToday = 0, tripsCompletedToday = 0, cancellationsToday = 0;
    try {
      [newBookingsToday, tripsStartedToday, tripsCompletedToday, cancellationsToday] = await Promise.all([
        // New bookings created today
        Booking.countDocuments({
          createdAt: { $gte: todayStart, $lte: todayEnd },
        }),

        // Trips started today: use startedAt (schema field, set in startTrip).
        // Fallback covers legacy docs created before startedAt was added to schema.
        Booking.countDocuments({
          $or: [
            // New data: startedAt explicitly set when driver clicks Start
            { startedAt: { $gte: todayStart, $lte: todayEnd } },
            // Legacy data: no startedAt yet, trip is in-progress/done, updated today
            {
              startedAt: { $exists: false },
              tripStatus: { $in: ['Started', 'Completed'] },
              bookingStatus: { $in: ['Confirmed', 'Completed'] },
              updatedAt: { $gte: todayStart, $lte: todayEnd },
            },
            // Also covers null (schema default = null, not missing)
            {
              startedAt: null,
              tripStatus: { $in: ['Started', 'Completed'] },
              bookingStatus: { $in: ['Confirmed', 'Completed'] },
              updatedAt: { $gte: todayStart, $lte: todayEnd },
            },
          ],
        }),

        // Trips completed today
        Booking.countDocuments({
          bookingStatus: 'Completed',
          $or: [
            { completedAt: { $gte: todayStart, $lte: todayEnd } },
            { completedAt: { $exists: false }, updatedAt: { $gte: todayStart, $lte: todayEnd } },
            { completedAt: null, updatedAt: { $gte: todayStart, $lte: todayEnd } },
          ],
        }),

        // Cancellations today
        Booking.countDocuments({
          bookingStatus: 'Cancelled',
          updatedAt: { $gte: todayStart, $lte: todayEnd },
        }),
      ]);
    } catch (e) {
      console.error('[Dashboard §4 activity]', e.message);
    }

    // ── SECTION 5: Recent bookings ────────────────────────────────────────
    let recentBookings = [];
    try {
      recentBookings = await Booking.find({})
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('userId', 'name email')
        .lean();
    } catch (e) {
      console.error('[Dashboard §5 recent bookings]', e.message);
    }

    // ── SECTION 6: Chart data ─────────────────────────────────────────────
    let monthlyData = [];
    try {
      monthlyData = await Booking.aggregate([
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]);
    } catch (e) {
      console.error('[Dashboard §6 charts]', e.message);
    }

    // ── Response ──────────────────────────────────────────────────────────
    res.json({
      // Core counts
      users: totalUsers,
      cabs: totalCabs,
      drivers: totalDrivers,
      bookings: totalBookings,

      // Fleet — Drivers (Available + Busy + Offline = totalDrivers)
      availableDrivers,
      busyDrivers,
      offlineDrivers,

      // Fleet — Vehicles (Available + Booked + Maintenance = totalCabs)
      availableVehicles,
      bookedVehicles,
      maintenanceVehicles,

      // Booking status breakdown
      pendingBookings,
      confirmedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,

      // Financial
      grossRevenue,    platformRevenue,  driverPayout,
      todayGross,      todayPlatform,    todayPayout,
      weeklyGross,     weeklyPlatform,   weeklyPayout,
      monthlyGross,    monthlyPlatform,  monthlyPayout,
      pendingPaymentsCount, refundsCount,

      // Today's activity
      newBookingsToday, tripsStartedToday, tripsCompletedToday, cancellationsToday,

      // Table / chart data
      recentBookings, monthlyData,

      // Legacy aliases
      totalRevenue:   grossRevenue,
      todayRevenue:   todayGross,
      monthlyRevenue: monthlyGross,
      completedTrips: completedBookings,
      todayBookings:  newBookingsToday,
    });
  } catch (err) {
    console.error('[Dashboard FATAL]', err.message, err.stack);
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get reports
// @route GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const vehicleUtilization = await Booking.aggregate([
      { $match: { carId: { $exists: true, $ne: null } } },
      { $group: { _id: '$carId', count: { $sum: 1 }, totalRevenue: { $sum: { $toDouble: { $ifNull: ['$fare', '0'] } } }, carname: { $first: '$carname' }, cartype: { $first: '$cartype' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const driverActivity = await Booking.aggregate([
      { $match: { driverId: { $exists: true, $ne: null }, bookingStatus: 'Completed' } },
      { $group: { _id: '$driverId', completedTrips: { $sum: 1 }, totalRevenue: { $sum: { $toDouble: { $ifNull: ['$fare', '0'] } } }, drivername: { $first: '$drivername' } } },
      { $sort: { completedTrips: -1 } },
      { $limit: 10 },
    ]);

    const monthlyBookings = await Booking.aggregate([
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'Completed'] }, 1, 0] } },
        revenue: { $sum: { $toDouble: { $ifNull: ['$fare', '0'] } } },
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