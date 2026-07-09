const Car = require('../models/CarSchema');

// Find available cars matching the type
const findAvailableCars = async (cartype) => {
  const query = { isAvailable: true };
  if (cartype) query.cartype = cartype;
  return await Car.find(query);
};

// Match a specific car to a booking
const matchCarToBooking = async (carId) => {
  const car = await Car.findById(carId);
  if (!car || !car.isAvailable) return null;
  return car;
};

module.exports = { findAvailableCars, matchCarToBooking };
