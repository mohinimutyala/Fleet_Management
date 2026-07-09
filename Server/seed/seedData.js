const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/AdminSchema');
const User = require('../models/UserSchema');
const Car = require('../models/CarSchema');
const Driver = require('../models/DriverSchema');
const Booking = require('../models/MyBookingSchema');

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    // Clear ALL existing data
    await Promise.all([Admin.deleteMany(), User.deleteMany(), Car.deleteMany(), Driver.deleteMany(), Booking.deleteMany()]);
    console.log('Cleared existing data');

    const hash = (pw) => bcrypt.hash(pw, 10);

    // Seed admin
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@cabgo.com',
      password: await hash('admin123'),
    });

    // Seed users
    const users = await User.create([
      { name: 'Priya Sharma',  email: 'priya@example.com',  password: await hash('user123'), phone: '9876543210' },
      { name: 'Rahul Verma',   email: 'rahul@example.com',  password: await hash('user123'), phone: '9876543211' },
      { name: 'Ananya Patel',  email: 'ananya@example.com', password: await hash('user123'), phone: '9876543212' },
    ]);

    // Seed drivers — no vehicle reference, status: Available/Busy/Offline
    const drivers = await Driver.create([
      { name: 'Pooja Singh',   email: 'pooja@cabgo.com',       password: await hash('driver123'), phone: '9001234561', licenseNo: 'MH01234', isOnline: true,  status: 'Available', rating: 4.8, totalRides: 0, totalEarnings: 0 },
      { name: 'Rahul Mehta',   email: 'rahulmehta@cabgo.com',  password: await hash('driver123'), phone: '9001234562', licenseNo: 'KA05678', isOnline: true,  status: 'Available', rating: 4.7, totalRides: 0,  totalEarnings: 0 },
      { name: 'Sneha Kapoor',  email: 'sneha@cabgo.com',       password: await hash('driver123'), phone: '9001234563', licenseNo: 'RJ09012', isOnline: false, status: 'Offline',   rating: 4.9, totalRides: 1, totalEarnings: 9300 },
      { name: 'Arjun Das',     email: 'arjun@cabgo.com',       password: await hash('driver123'), phone: '9001234564', licenseNo: 'DL03456', isOnline: true,  status: 'Available', rating: 4.6, totalRides: 0,  totalEarnings: 0 },
      { name: 'Meera Nair',    email: 'meera@cabgo.com',       password: await hash('driver123'), phone: '9001234565', licenseNo: 'TN07890', isOnline: false, status: 'Offline',   rating: 4.9, totalRides: 0, totalEarnings: 0 },
    ]);

    // Seed vehicles — no driver assignment, vehicleStatus: Available/Booked/Maintenance
    const cars = await Car.create([
      { carname: 'Maruti Swift',   cartype: 'Hatchback', price: '10', carno: 'MH 12 XY 5678', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://localhost:5000/uploads/hatchback.png' },
      { carname: 'Honda City',     cartype: 'Sedan',     price: '14', carno: 'KA 05 CD 9013', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://localhost:5000/uploads/sedan.png' },
      { carname: 'Toyota Etios',   cartype: 'Sedan',     price: '12', carno: 'RJ 14 QW 3456', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://localhost:5000/uploads/sedan.png' },
      { carname: 'Mahindra XUV',   cartype: 'SUV',       price: '18', carno: 'DL 04 AB 7890', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://localhost:5000/uploads/suv.png' },
      { carname: 'Ola Electric',   cartype: 'Mini',      price: '7',  carno: 'TN 07 CD 1234', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://localhost:5000/uploads/mini.png' },
      { carname: 'Hero Splendor',  cartype: 'Bike',      price: '5',  carno: 'MH 13 XZ 9876', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://localhost:5000/uploads/bike.png' },
      { carname: 'BMW 5 Series',   cartype: 'Luxury',    price: '30', carno: 'DL 05 MN 5678', vehicleStatus: 'Available', isAvailable: true, carImage: 'http://localhost:5000/uploads/luxury.png' },
    ]);

    // Seed sample bookings using new schema
    const today = new Date().toISOString().split('T')[0];

    await Booking.create([
      {
        selectedPickupCity: 'Hyderabad',  pickupAddress: 'Hitech City',
        selectedDropCity: 'Vijayawada',   dropAddress: 'Bus Stand',
        pickupdate: today, pickuptime: '09:00',
        fare: '2750', carname: 'Maruti Swift', cartype: 'Hatchback',
        carno: cars[0].carno, price: '10', carId: cars[0]._id,
        userId: users[0]._id, userName: 'Priya Sharma',
        paymentMethod: 'Cash',
        bookingStatus: 'Pending', tripStatus: 'Waiting',
        bookeddate: today,
      },
      {
        selectedPickupCity: 'Bengaluru', pickupAddress: 'Koramangala',
        selectedDropCity: 'Chennai',     dropAddress: 'T. Nagar',
        pickupdate: today, pickuptime: '14:00',
        fare: '4140', carname: 'Honda City', cartype: 'Sedan',
        carno: cars[1].carno, price: '14', carId: cars[1]._id,
        driverId: drivers[0]._id, drivername: drivers[0].name,
        userId: users[1]._id, userName: 'Rahul Verma',
        paymentMethod: 'UPI', assignedAt: new Date(),
        bookingStatus: 'Confirmed', tripStatus: 'Assigned',
        bookeddate: today,
      },
      {
        selectedPickupCity: 'Visakhapatnam', pickupAddress: 'RK Beach',
        selectedDropCity: 'Hyderabad',        dropAddress: 'Secunderabad',
        pickupdate: today, pickuptime: '07:00',
        fare: '9300', carname: 'Mahindra XUV', cartype: 'SUV',
        carno: cars[3].carno, price: '15', carId: cars[3]._id,
        driverId: drivers[2]._id, drivername: drivers[2].name,
        userId: users[2]._id, userName: 'Ananya Patel',
        paymentMethod: 'Card',
        bookingStatus: 'Completed', tripStatus: 'Completed', paymentStatus: 'Paid',
        bookeddate: today,
      },
      {
        selectedPickupCity: 'Kochi',      pickupAddress: 'MG Road',
        selectedDropCity: 'Mysuru',       dropAddress: 'Chamundi Hills',
        pickupdate: today, pickuptime: '11:00',
        fare: '6000', carname: 'BMW 5 Series', cartype: 'Luxury',
        carno: cars[6].carno, price: '15', carId: cars[6]._id,
        userId: users[0]._id, userName: 'Priya Sharma',
        paymentMethod: 'Card',
        bookingStatus: 'Pending', tripStatus: 'Waiting',
        bookeddate: today,
      },
    ]);

    console.log('✅ Seed data inserted successfully!');
    console.log('');
    console.log('Credentials:');
    console.log('  Admin:  admin@cabgo.com  / admin123');
    console.log('  User:   priya@example.com / user123');
    console.log('  Driver: pooja@cabgo.com  / driver123  (status: Available)');
    console.log('  Driver: rahulmehta@cabgo.com / driver123 (status: Available, assigned to booking 2)');
    console.log('');
    console.log('Sample Data:');
    console.log('  2 Pending Bookings (need driver assignment)');
    console.log('  1 Confirmed Booking (driver assigned)');
    console.log('  1 Completed Trip (with revenue)');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
