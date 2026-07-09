// Fare calculation service based on city distance and cab type
const CITY_DISTANCES = {
  // Hyderabad pairs
  'Hyderabad-Vijayawada': 275, 'Hyderabad-Visakhapatnam': 620, 'Hyderabad-Rajahmundry': 430,
  'Hyderabad-Tirupati': 550, 'Hyderabad-Bengaluru': 570, 'Hyderabad-Chennai': 630,
  'Hyderabad-Mysuru': 710, 'Hyderabad-Kochi': 1040,
  
  // Vijayawada pairs
  'Vijayawada-Visakhapatnam': 350, 'Vijayawada-Rajahmundry': 160, 'Vijayawada-Tirupati': 415,
  'Vijayawada-Bengaluru': 640, 'Vijayawada-Chennai': 450, 'Vijayawada-Mysuru': 785,
  'Vijayawada-Kochi': 1130,

  // Visakhapatnam pairs
  'Visakhapatnam-Rajahmundry': 190, 'Visakhapatnam-Tirupati': 740, 'Visakhapatnam-Bengaluru': 1000,
  'Visakhapatnam-Chennai': 800, 'Visakhapatnam-Mysuru': 1140, 'Visakhapatnam-Kochi': 1470,

  // Rajahmundry pairs
  'Rajahmundry-Tirupati': 575, 'Rajahmundry-Bengaluru': 800, 'Rajahmundry-Chennai': 600,
  'Rajahmundry-Mysuru': 950, 'Rajahmundry-Kochi': 1280,

  // Tirupati pairs
  'Tirupati-Bengaluru': 250, 'Tirupati-Chennai': 135, 'Tirupati-Mysuru': 395, 'Tirupati-Kochi': 650,

  // Bengaluru pairs
  'Bengaluru-Chennai': 345, 'Bengaluru-Mysuru': 145, 'Bengaluru-Kochi': 550,

  // Chennai pairs
  'Chennai-Mysuru': 480, 'Chennai-Kochi': 690,

  // Mysuru pairs
  'Mysuru-Kochi': 400,
};

const CAB_FARE_PER_KM = {
  'Mini': 8, 'Hatchback': 9, 'Sedan': 12, 'SUV': 15, 'Premium': 18,
  'Luxury': 25, 'Bike': 5, 'Auto': 6,
};

const BASE_FARE = {
  'Mini': 50, 'Hatchback': 50, 'Sedan': 75, 'SUV': 100, 'Premium': 150,
  'Luxury': 250, 'Bike': 20, 'Auto': 30,
};

const getDistance = (fromCity, toCity) => {
  const key1 = `${fromCity}-${toCity}`;
  const key2 = `${toCity}-${fromCity}`;
  return CITY_DISTANCES[key1] || CITY_DISTANCES[key2] || Math.floor(Math.random() * 500) + 50;
};

const calculateFare = (pickupCity, dropCity, cartype) => {
  const distance = getDistance(pickupCity, dropCity);
  const perKm = CAB_FARE_PER_KM[cartype] || 10;
  const base = BASE_FARE[cartype] || 50;
  const totalFare = base + distance * perKm;
  return { distance, totalFare, perKm, base };
};

module.exports = { calculateFare, getDistance };
