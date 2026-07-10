// Fare calculation service based on city distance and cab type
// Fare calculation service based on city distance and cab type

// === COMMISSION CONFIG (single source of truth) ===
// Change this one value to update the commission split everywhere
const DRIVER_COMMISSION_RATE = 0.30; // Driver gets 30%, platform keeps 70%

/**
 * Calculate driver commission and platform revenue from a fare
 * @param {number|string} fare - Total booking fare
 * @returns {{ driverCommission: number, platformRevenue: number }}
 */
const calculateCommission = (fare) => {
  const f = parseFloat(fare) || 0;
  const driverCommission = parseFloat((f * DRIVER_COMMISSION_RATE).toFixed(2));
  const platformRevenue = parseFloat((f * (1 - DRIVER_COMMISSION_RATE)).toFixed(2));
  return { driverCommission, platformRevenue };
};
  

const CAB_FARE_PER_KM = {
  'Mini': 8, 'Hatchback': 9, 'Sedan': 12, 'SUV': 15, 'Premium': 18,
  'Luxury': 25, 'Bike': 5, 'Auto': 6,
};

const BASE_FARE = {
  'Mini': 50, 'Hatchback': 50, 'Sedan': 75, 'SUV': 100, 'Premium': 150,
  'Luxury': 250, 'Bike': 20, 'Auto': 30,
};
const axios = require("axios");

async function getCoordinates(place) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;

    const response = await axios.get(url, {
        headers: {
            "User-Agent": "CarGo/1.0"
        }
    });

    if (!response.data.length) {
        throw new Error(`Location not found: ${place}`);
    }

    return {
        lat: response.data[0].lat,
        lon: response.data[0].lon
    };
}
async function getDistance(fromPlace, toPlace) {

    const from = await getCoordinates(fromPlace);

    const to = await getCoordinates(toPlace);

    const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${from.lon},${from.lat};${to.lon},${to.lat}` +
        `?overview=false`;

    const response = await axios.get(url);

    const route = response.data.routes[0];

    return {
        distance: Math.round(route.distance / 1000),
        duration: Math.round(route.duration / 60)
    };
}
async function calculateFare(pickup, drop, cartype) {

    const route = await getDistance(pickup, drop);

    const perKm = CAB_FARE_PER_KM[cartype] || 10;

    const base = BASE_FARE[cartype] || 50;

    const totalFare = base + route.distance * perKm;

    return {
        distance: route.distance,
        duration: route.duration,
        totalFare,
        base,
        perKm
    };
}


module.exports = { calculateFare, getDistance, calculateCommission, DRIVER_COMMISSION_RATE };
