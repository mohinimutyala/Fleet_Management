const Booking = require('../models/MyBookingSchema');
const Car = require('../models/CarSchema');
const Driver = require('../models/DriverSchema');
const { calculateFare, calculateCommission } = require('../services/fareService');
// @desc  Create booking (no driver assigned yet — pending admin assignment)
// @route POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const {
      selectedPickupCity, pickupAddress,
      selectedDropCity, dropAddress,
      pickupdate, pickuptime,
      carId, paymentMethod, notes,
    } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Vehicle not found' });
    if (car.vehicleStatus === 'Booked') return res.status(400).json({ message: 'Vehicle is already booked' });

      const fareData = await calculateFare(
    selectedPickupCity,
    selectedDropCity,
    car.cartype
);

    const booking = await Booking.create({
      selectedPickupCity,
      pickupAddress: pickupAddress || '',
      selectedDropCity,
      dropAddress: dropAddress || '',
      pickupdate, pickuptime,
      fare: fareData.totalFare.toString(),
      carname: car.carname,
      cartype: car.cartype,
      carno: car.carno,
      price: car.price,
      userId: req.user.id,
      userName: req.body.userName || '',
      carId,
      paymentMethod: paymentMethod || 'Cash',
      notes: notes || '',
      bookingStatus: 'Pending',
      tripStatus: 'Waiting',
    });

    res.status(201).json({ booking, fareData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Calculate fare (preview)
// @route POST /api/bookings/calculate-fare
const calculateFarePreview = async (req, res) => {
  try {
    const { pickupCity, dropCity, cartype } = req.body;
    if (!pickupCity || !dropCity || !cartype)
      return res.status(400).json({ message: 'pickupCity, dropCity, cartype are required' });
    const result = await calculateFare(
    pickupCity,
    dropCity,
    cartype
);
    res.json(result);
  } catch (err) {
    console.log('fare Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get my bookings (user)
// @route GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all bookings (admin)
// @route GET /api/bookings/all
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get pending bookings (admin — awaiting driver assignment)
// @route GET /api/bookings/pending
const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ bookingStatus: 'Pending' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('carId', 'carname cartype carno carImage vehicleStatus');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get booking by ID
// @route GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('driverId', 'name email phone status')
      .populate('carId', 'carname cartype carno carImage vehicleStatus');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete booking
// @route DELETE /api/bookings/:id
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // If confirmed, free up driver and vehicle
    if (booking.bookingStatus === 'Confirmed' && booking.driverId) {
      await Driver.findByIdAndUpdate(booking.driverId, { status: 'Available' });
      if (booking.carId) await Car.findByIdAndUpdate(booking.carId, { vehicleStatus: 'Available' });
    }
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Assign driver to booking (admin)
// @route PUT /api/bookings/:id/assign-driver
const assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    if (!driverId) return res.status(400).json({ message: 'driverId is required' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.bookingStatus !== 'Pending')
      return res.status(400).json({ message: 'Booking is not pending' });

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (driver.status !== 'Available')
      return res.status(400).json({ message: 'Driver is not available' });

    // Update booking
    booking.driverId = driver._id;
    booking.drivername = driver.name;
    booking.bookingStatus = 'Confirmed';
    booking.tripStatus = 'Assigned';
    booking.assignedAt = new Date();
    await booking.save();

    // Update driver status
    await Driver.findByIdAndUpdate(driverId, { status: 'Busy' });

    // Update vehicle status
    if (booking.carId) {
      await Car.findByIdAndUpdate(booking.carId, { vehicleStatus: 'Booked' });
    }

    const updated = await Booking.findById(booking._id)
      .populate('driverId', 'name email phone')
      .populate('carId', 'carname cartype carno carImage');

    res.json({ message: 'Driver assigned successfully', booking: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Complete trip (admin or driver)
// @route PUT /api/bookings/:id/complete-trip
const completeTrip = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.bookingStatus === 'Completed')
      return res.status(400).json({ message: 'Trip already completed' });
    if (booking.tripStatus !== 'Started')
      return res.status(400).json({ message: 'Trip must be started before completing' });

    // Verify the caller is the assigned driver
    if (!booking.driverId || booking.driverId.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Only the assigned driver can complete this trip' });

    // Calculate 30/70 commission split (stored permanently)
    const { driverCommission, platformRevenue } = calculateCommission(booking.fare);

    // Update booking
    booking.bookingStatus = 'Completed';
    booking.tripStatus = 'Completed';
    booking.paymentStatus = 'Paid';
    booking.driverCommission = driverCommission;
    booking.platformRevenue = platformRevenue;
    booking.completedAt = new Date();
    await booking.save();

    // Free driver
    if (booking.driverId) {
      const driver = await Driver.findById(booking.driverId);
      if (driver) {
        driver.status = 'Available';
        driver.totalRides = (driver.totalRides || 0) + 1;
        driver.totalEarnings = (driver.totalEarnings || 0) + driverCommission;
        await driver.save();
      }
    }

    // Free vehicle
    if (booking.carId) {
      await Car.findByIdAndUpdate(booking.carId, { vehicleStatus: 'Available' });
    }

    res.json({
      message: 'Trip completed successfully',
      booking,
      driverCommission,
      platformRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Cancel booking (admin or user)
// @route PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.bookingStatus = 'Cancelled';
    await booking.save();

    if (booking.driverId) await Driver.findByIdAndUpdate(booking.driverId, { status: 'Available' });
    if (booking.carId) await Car.findByIdAndUpdate(booking.carId, { vehicleStatus: 'Available' });

    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get driver bookings (driver portal)
// @route GET /api/bookings/driver
const getDriverBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ driverId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('carId', 'carname cartype carno carImage');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Start trip (driver)
// @route PUT /api/bookings/:id/start-trip
const startTrip = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.tripStatus !== 'Assigned')
      return res.status(400).json({ message: 'Trip must be assigned before starting' });
    booking.tripStatus = 'Started';
    booking.startedAt = new Date();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createBooking, calculateFarePreview, getMyBookings, getAllBookings,
  getPendingBookings, getBookingById, deleteBooking,
  assignDriver, completeTrip, cancelBooking,
  getDriverBookings, startTrip,
};
