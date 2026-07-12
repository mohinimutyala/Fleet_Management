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


const geoAxios = axios.create({
  timeout: 15000,
  family: 4,
});


// Shared axios instance with 10-second timeout to prevent hanging requests
const geoAxios = axios.create({ timeout: 10000 });

/**
 * Geocode a place name to lat/lon using Nominatim
 * @param {string} place
 * @returns {{ lat: string, lon: string }}
 */
async function getCoordinates(place) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
  let response;
  try {
    response = await geoAxios.get(url, {
      headers: { 'User-Agent': 'CarGo/1.0' },
    });
  } catch (err) {
    const status = err.response?.status;
    if (status === 429 || status === 502 || status === 503) {
      throw new Error(`Geocoding service is temporarily overloaded (${status}). Please try again in a few moments.`);
    }
    throw new Error(`Geocoding service unavailable for "${place}". Please check your internet connection or try again.`);
  }

  if (!response.data || !response.data.length) {
    throw new Error(`Location not found: "${place}". Please check the city name and try again.`);
  }

  return {
    lat: response.data[0].lat,
    lon: response.data[0].lon,
  };
}

/**
 * Get driving distance and duration between two place names using OSRM
 * @param {string} fromPlace
 * @param {string} toPlace
 * @returns {{ distance: number, duration: number }} — km and minutes
 */
// async function getDistance(fromPlace, toPlace) {
//   const [from, to] = await Promise.all([
//     getCoordinates(fromPlace),
//     getCoordinates(toPlace),
//   ]);

//   const url =
//     `https://router.project-osrm.org/route/v1/driving/` +
//     `${from.lon},${from.lat};${to.lon},${to.lat}` +
//     `?overview=false`;

//   let response;
//   try {
//     response = await geoAxios.get(url, {
//       headers: { 'User-Agent': 'CarGo/1.0' },
//     });
//   } catch (err) {
//     const status = err.response?.status;
//     if (status === 429 || status === 502 || status === 503) {
//       throw new Error(`Routing service is temporarily busy (${status}). Please try again in a few moments.`);
//     }
//     throw new Error(`Routing service unavailable. Please try again shortly. (Error: ${status || err.message})`);
//   }

//   if (
//     !response ||
//     !response.data ||
//     !response.data.routes ||
//     !response.data.routes.length ||
//     !response.data.routes[0]
//   ) {
//     throw new Error(`No driving route found between "${fromPlace}" and "${toPlace}".`);
//   }

//   const route = response.data.routes[0];
//   const distanceKm = Math.round(route.distance / 1000);
//   const durationMin = Math.round(route.duration / 60);

//   if (distanceKm === 0) {
//     throw new Error(`The calculated distance between "${fromPlace}" and "${toPlace}" is zero. Please verify the locations.`);
//   }

//   return {
//     distance: distanceKm,
//     duration: durationMin,
//   };
// }





async function getDistance(fromPlace, toPlace) {
  try {
    console.log("FROM PLACE:", fromPlace);
    console.log("TO PLACE:", toPlace);

    const [from, to] = await Promise.all([
      getCoordinates(fromPlace),
      getCoordinates(toPlace),
    ]);

    console.log("FROM COORDS:", from);
    console.log("TO COORDS:", to);

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lon},${from.lat};${to.lon},${to.lat}` +
      `?overview=false`;

    console.log("OSRM URL:", url);

    const response = await geoAxios.get(url, {
      headers: {
        "User-Agent": "CarGo/1.0",
      },
      timeout: 10000,
    });

    console.log("OSRM RESPONSE:", response.data);

    if (
      !response.data ||
      !response.data.routes ||
      !response.data.routes.length
    ) {
      throw new Error("No route returned from OSRM");
    }

    const route = response.data.routes[0];

    return {
      distance: Math.round(route.distance / 1000),
      duration: Math.round(route.duration / 60),
    };
    
  } catch (err) {
  console.log("FULL ERROR:", err);
  console.log("ERROR CODE:", err.code);
  console.log("ERROR MESSAGE:", err.message);
  console.log("ERROR RESPONSE:", err.response?.data);

  if (err.code === "ETIMEDOUT") {
    throw new Error("Routing request timed out.");
  }

  if (err.code === "ECONNRESET") {
    throw new Error("Connection reset by routing service.");
  }

  if (err.code === "ENETUNREACH") {
    throw new Error("Network unreachable.");
  }

  throw new Error(
    `Routing service unavailable. (${err.code || err.message})`
  );
}
}






/**
 * Calculate full fare breakdown for a booking
 * @param {string} pickup - Pickup city/location name
 * @param {string} drop   - Drop city/location name
 * @param {string} cartype - Vehicle type (Mini, Sedan, SUV, etc.)
 * @returns {{ distance, duration, totalFare, base, perKm }}
 */
async function calculateFare(pickup, drop, cartype) {
  // This will throw a descriptive error if anything fails — let callers handle it
  const route = await getDistance(pickup, drop);

  const perKm = CAB_FARE_PER_KM[cartype] || 10;
  const base = BASE_FARE[cartype] || 50;
  const totalFare = base + route.distance * perKm;

  return {
    distance: route.distance,
    duration: route.duration,
    totalFare,
    base,
    perKm,
  };
}

module.exports = { calculateFare, getDistance, getCoordinates, calculateCommission, DRIVER_COMMISSION_RATE };
