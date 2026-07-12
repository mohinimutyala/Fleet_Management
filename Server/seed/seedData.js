const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin    = require('../models/AdminSchema');
const User     = require('../models/UserSchema');
const Car      = require('../models/CarSchema');
const Driver   = require('../models/DriverSchema');
const Booking  = require('../models/MyBookingSchema');
const { calculateCommission } = require('../services/fareService');

const MONGO_URI = process.env.MONGO_URI;

// ─── Helper ────────────────────────────────────────────────────────────────────
const hash = (pw) => bcrypt.hash(pw, 10);

// Build a completed booking object with all required financial fields filled in
const completedBooking = ({
  pickup, pickupAddr = '', drop, dropAddr = '',
  date, time, fare,
  car, carIdx, driver,
  user, userName,
  paymentMethod = 'Cash',
  daysAgo = 0,
}) => {
  const fareNum = parseFloat(fare);
  const { driverCommission, platformRevenue } = calculateCommission(fareNum);
  const completedAt = new Date();
  completedAt.setDate(completedAt.getDate() - daysAgo);

  return {
    selectedPickupCity: pickup,  pickupAddress: pickupAddr,
    selectedDropCity:   drop,    dropAddress:   dropAddr,
    pickupdate: date, pickuptime: time,
    fare: fare.toString(),
    driverCommission,
    platformRevenue,
    carname: car.carname, cartype: car.cartype, carno: car.carno,
    price: car.price, carId: car._id,
    driverId: driver._id, drivername: driver.name,
    userId: user._id, userName,
    paymentMethod,
    bookingStatus: 'Completed', tripStatus: 'Completed', paymentStatus: 'Paid',
    assignedAt: new Date(completedAt.getTime() - 3600000),
    startedAt:  new Date(completedAt.getTime() - 1800000),
    completedAt,
    bookeddate: date,
  };
};

// ─── Seed ──────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    await Promise.all([
      Admin.deleteMany(), User.deleteMany(),
      Car.deleteMany(), Driver.deleteMany(), Booking.deleteMany(),
    ]);
    console.log('Cleared existing data');

    // ── Admin ─────────────────────────────────────────────────────────────────
    await Admin.create({ name: 'Super Admin', email: 'admin@cabgo.com', password: await hash('admin123') });

    // ── Users ─────────────────────────────────────────────────────────────────
    const users = await User.create([
      { name: 'Priya Sharma',  email: 'priya@example.com',  password: await hash('user123'), phone: '9876543210' },
      { name: 'Rahul Verma',   email: 'rahul@example.com',  password: await hash('user123'), phone: '9876543211' },
      { name: 'Ananya Patel',  email: 'ananya@example.com', password: await hash('user123'), phone: '9876543212' },
    ]);

    // ── Vehicles ──────────────────────────────────────────────────────────────
    const cars = await Car.create([
      
      { carname: 'Maruti Swift',  cartype: 'Hatchback', price: '10', carno: 'MH 12 XY 5678', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://3.27.17.6:5000/uploads/hatchback.png' },
      { carname: 'Honda City',    cartype: 'Sedan',     price: '14', carno: 'KA 05 CD 9013', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://3.27.17.6:5000/uploads/sedan.png' },
      { carname: 'Toyota Etios',  cartype: 'Sedan',     price: '12', carno: 'RJ 14 QW 3456', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://3.27.17.6:5000/uploads/sedan.png' },
      { carname: 'Mahindra XUV',  cartype: 'SUV',       price: '18', carno: 'DL 04 AB 7890', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://3.27.17.6:5000/uploads/suv.png' },
      { carname: 'Ola Electric',  cartype: 'Mini',      price: '7',  carno: 'TN 07 CD 1234', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://3.27.17.6:5000/uploads/mini.png' },
      { carname: 'Hero Splendor', cartype: 'Bike',      price: '5',  carno: 'MH 13 XZ 9876', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://3.27.17.6:5000/uploads/bike.png' },
      { carname: 'BMW 5 Series',  cartype: 'Luxury',    price: '30', carno: 'DL 05 MN 5678', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://3.27.17.6:5000/uploads/luxury.png' },
    ]);

    // ── Compute earnings for each driver from their completed trips ────────────
    // Sneha:  3 completed trips → fares: 9300 + 4140 + 5175 = 18615 → 30% = 5584.50
    // Arjun:  2 completed trips → fares: 2750 + 3400         = 6150  → 30% = 1845
    // Meera:  1 completed trip  → fare:  6000                         → 30% = 1800
    // Pooja / Rahul: 0 completed (pending/confirmed only)
    const snehaEarnings = Math.round((9300 + 4140 + 5175) * 0.30);  // 5585
    const arjunEarnings = Math.round((2750 + 3400) * 0.30);          // 1845
    const meeraEarnings = Math.round(6000 * 0.30);                   // 1800

    // ── Drivers ───────────────────────────────────────────────────────────────
    const drivers = await Driver.create([
      { name: 'Pooja Singh',  email: 'pooja@cabgo.com',      password: await hash('driver123'), phone: '9001234561', licenseNo: 'MH01234', isOnline: true,  status: 'Available', rating: 4.8, totalRides: 0, totalEarnings: 0 },
      { name: 'Rahul Mehta',  email: 'rahulmehta@cabgo.com', password: await hash('driver123'), phone: '9001234562', licenseNo: 'KA05678', isOnline: true,  status: 'Available', rating: 4.7, totalRides: 0, totalEarnings: 0 },
      { name: 'Sneha Kapoor', email: 'sneha@cabgo.com',      password: await hash('driver123'), phone: '9001234563', licenseNo: 'RJ09012', isOnline: true,  status: 'Available', rating: 4.9, totalRides: 3, totalEarnings: snehaEarnings },
      { name: 'Arjun Das',    email: 'arjun@cabgo.com',      password: await hash('driver123'), phone: '9001234564', licenseNo: 'DL03456', isOnline: true,  status: 'Available', rating: 4.6, totalRides: 2, totalEarnings: arjunEarnings },
      { name: 'Meera Nair',   email: 'meera@cabgo.com',      password: await hash('driver123'), phone: '9001234565', licenseNo: 'TN07890', isOnline: false, status: 'Offline',   rating: 4.9, totalRides: 1, totalEarnings: meeraEarnings },
    ]);

    const today = new Date().toISOString().split('T')[0];

    // ─ Past dates ─
    const d = (n) => {
      const dt = new Date();
      dt.setDate(dt.getDate() - n);
      return dt.toISOString().split('T')[0];
    };

    // ── Bookings ──────────────────────────────────────────────────────────────

    // 1. Sneha's 3 completed trips (historical — 5, 3, 1 days ago)
    const snehaB1 = completedBooking({
      pickup: 'Visakhapatnam', pickupAddr: 'RK Beach',
      drop: 'Hyderabad', dropAddr: 'Secunderabad',
      date: d(5), time: '07:00', fare: '9300',
      car: cars[3], driver: drivers[2], user: users[2], userName: 'Ananya Patel',
      paymentMethod: 'Card', daysAgo: 5,
    });

    const snehaB2 = completedBooking({
      pickup: 'Bengaluru', pickupAddr: 'Koramangala',
      drop: 'Chennai', dropAddr: 'T. Nagar',
      date: d(3), time: '08:30', fare: '4140',
      car: cars[1], driver: drivers[2], user: users[1], userName: 'Rahul Verma',
      paymentMethod: 'UPI', daysAgo: 3,
    });

    const snehaB3 = completedBooking({
      pickup: 'Hyderabad', pickupAddr: 'Hitech City',
      drop: 'Tirupati', dropAddr: 'Tirumala Temple',
      date: d(1), time: '05:00', fare: '5175',
      car: cars[0], driver: drivers[2], user: users[0], userName: 'Priya Sharma',
      paymentMethod: 'Cash', daysAgo: 1,
    });

    // 2. Arjun's 2 completed trips (4 and 2 days ago)
    const arjunB1 = completedBooking({
      pickup: 'Hyderabad', pickupAddr: 'Banjara Hills',
      drop: 'Vijayawada', dropAddr: 'Bus Stand',
      date: d(4), time: '09:00', fare: '2750',
      car: cars[0], driver: drivers[3], user: users[0], userName: 'Priya Sharma',
      paymentMethod: 'Cash', daysAgo: 4,
    });

    const arjunB2 = completedBooking({
      pickup: 'Bengaluru', pickupAddr: 'MG Road',
      drop: 'Mysuru', dropAddr: 'Chamundi Hills',
      date: d(2), time: '10:00', fare: '3400',
      car: cars[2], driver: drivers[3], user: users[1], userName: 'Rahul Verma',
      paymentMethod: 'UPI', daysAgo: 2,
    });

    // 3. Meera's 1 completed trip (6 days ago)
    const meeraB1 = completedBooking({
      pickup: 'Kochi', pickupAddr: 'MG Road',
      drop: 'Mysuru', dropAddr: 'Chamundi Hills',
      date: d(6), time: '11:00', fare: '6000',
      car: cars[6], driver: drivers[4], user: users[0], userName: 'Priya Sharma',
      paymentMethod: 'Card', daysAgo: 6,
    });

    // 4. Today's completed trip (Sneha — shows in "Today" revenue)
    const todayCompleted = completedBooking({
      pickup: 'Chennai', pickupAddr: 'Anna Nagar',
      drop: 'Tirupati', dropAddr: 'Bus Stand',
      date: today, time: '06:00', fare: '1620',
      car: cars[1], driver: drivers[2], user: users[2], userName: 'Ananya Patel',
      paymentMethod: 'Cash', daysAgo: 0,
    });

    // 5. Active bookings — 1 Confirmed (Pooja assigned), 2 Pending
    const activeBookings = [
      {
        selectedPickupCity: 'Hyderabad',  pickupAddress: 'Hitech City',
        selectedDropCity: 'Vijayawada',   dropAddress: 'Bus Stand',
        pickupdate: today, pickuptime: '14:00',
        fare: '2750', carname: cars[0].carname, cartype: cars[0].cartype,
        carno: cars[0].carno, price: '10', carId: cars[0]._id,
        driverId: drivers[0]._id, drivername: drivers[0].name,
        userId: users[1]._id, userName: 'Rahul Verma',
        paymentMethod: 'UPI', assignedAt: new Date(),
        bookingStatus: 'Confirmed', tripStatus: 'Assigned',
        bookeddate: today,
      },
      {
        selectedPickupCity: 'Bengaluru', pickupAddress: 'Koramangala',
        selectedDropCity: 'Chennai',     dropAddress: 'T. Nagar',
        pickupdate: today, pickuptime: '17:00',
        fare: '4140', carname: cars[1].carname, cartype: cars[1].cartype,
        carno: cars[1].carno, price: '14', carId: cars[1]._id,
        userId: users[0]._id, userName: 'Priya Sharma',
        paymentMethod: 'Cash',
        bookingStatus: 'Pending', tripStatus: 'Waiting',
        bookeddate: today,
      },
      {
        selectedPickupCity: 'Kochi',    pickupAddress: 'MG Road',
        selectedDropCity: 'Bengaluru',  dropAddress: 'Whitefield',
        pickupdate: today, pickuptime: '19:00',
        fare: '5500', carname: cars[3].carname, cartype: cars[3].cartype,
        carno: cars[3].carno, price: '18', carId: cars[3]._id,
        userId: users[2]._id, userName: 'Ananya Patel',
        paymentMethod: 'UPI',
        bookingStatus: 'Pending', tripStatus: 'Waiting',
        bookeddate: today,
      },
    ];

    await Booking.create([
      snehaB1, snehaB2, snehaB3,
      arjunB1, arjunB2,
      meeraB1,
      todayCompleted,
      ...activeBookings,
    ]);

    // ── Summary ────────────────────────────────────────────────────────────────
    const totalFare   = [9300, 4140, 5175, 2750, 3400, 6000, 1620].reduce((a, b) => a + b, 0);
    const platRevenue = (totalFare * 0.70).toFixed(2);
    const drvPayout   = (totalFare * 0.30).toFixed(2);

    console.log('\n✅ Seed data inserted successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin   admin@cabgo.com        / admin123');
    console.log('  User    priya@example.com      / user123');
    console.log('  Driver  pooja@cabgo.com        / driver123  (Confirmed booking)');
    console.log('  Driver  rahulmehta@cabgo.com   / driver123');
    console.log('  Driver  sneha@cabgo.com        / driver123  (3 completed + 1 today)');
    console.log('  Driver  arjun@cabgo.com        / driver123  (2 completed)');
    console.log('  Driver  meera@cabgo.com        / driver123  (1 completed)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('REVENUE SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Gross Revenue (GMV)   ₹${totalFare}`);
    console.log(`  Platform Revenue 70%  ₹${platRevenue}`);
    console.log(`  Driver Payout    30%  ₹${drvPayout}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('BOOKINGS');
    console.log('  7 Completed (with full financial data)');
    console.log('  1 Confirmed  (Pooja assigned — ready to Start)');
    console.log('  2 Pending    (awaiting driver assignment)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();