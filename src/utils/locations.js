/**
 * Predefined locations for the application
 * Each location has a name, latitude, and longitude
 */

// Residential locations where employees might live
const residentialLocations = [
  {
    id: 1,
    name: "Westside Residential",
    latitude: 40.7686,
    longitude: -74.0423, // Slightly west of Westside
    description: "Western residential area"
  },
  {
    id: 2,
    name: "Uptown Heights",
    latitude: 40.8175,
    longitude: -73.9526, // Slightly north of Uptown
    description: "Northern residential district"
  },
  {
    id: 3,
    name: "Midtown Apartments",
    latitude: 40.7649,
    longitude: -73.9940, // Slightly north of Midtown
    description: "Central residential area"
  },
  {
    id: 4,
    name: "Eastside Homes",
    latitude: 40.7559,
    longitude: -73.9401, // Slightly east of Eastside
    description: "Eastern residential area"
  },
  {
    id: 5,
    name: "Southside Community",
    latitude: 40.6682,
    longitude: -73.9542, // Slightly south of Southside
    description: "Southern residential district"
  },
  {
    id: 6,
    name: "Northeast Neighborhood",
    latitude: 40.7778,
    longitude: -73.9123, // Slightly northeast of Northeast
    description: "Northeastern residential area"
  }
];

// Commercial/business locations where jobs might be located
const businessLocations = [
  {
    id: 101,
    name: "Downtown Business District",
    latitude: 40.7128,
    longitude: -74.0060,
    description: "Central business district"
  },
  {
    id: 102,
    name: "Uptown Commercial",
    latitude: 40.8075,
    longitude: -73.9626,
    description: "Northern business zone"
  },
  {
    id: 103,
    name: "Midtown Corporate Center",
    latitude: 40.7549,
    longitude: -73.9840,
    description: "Middle commercial district"
  },
  {
    id: 104,
    name: "Westside Business Park",
    latitude: 40.7586,
    longitude: -74.0223, // Slightly east of Westside Residential
    description: "Western business park"
  },
  {
    id: 105,
    name: "Eastside Commerce Hub",
    latitude: 40.7659,
    longitude: -73.9501,
    description: "Eastern business sector"
  },
  {
    id: 106,
    name: "Southside Industrial",
    latitude: 40.6782,
    longitude: -73.9442,
    description: "Southern industrial zone"
  },
  {
    id: 107,
    name: "Northwest Tech Campus",
    latitude: 40.7829,
    longitude: -73.9654,
    description: "Northwestern technology district"
  },
  {
    id: 108,
    name: "Northeast Business Center",
    latitude: 40.7678,
    longitude: -73.9223,
    description: "Northeastern business area"
  }
];

// All locations combined
const allLocations = [...residentialLocations, ...businessLocations];

/**
 * Get all predefined locations
 * @returns {Array} Array of all location objects
 */
export const getAllLocations = () => {
  return allLocations;
};

/**
 * Get all residential locations (for employee registration)
 * @returns {Array} Array of residential location objects
 */
export const getResidentialLocations = () => {
  return residentialLocations;
};

/**
 * Get all business locations (for job postings)
 * @returns {Array} Array of business location objects
 */
export const getBusinessLocations = () => {
  return businessLocations;
};

/**
 * Find a location by its ID
 * @param {number} id Location ID
 * @returns {Object|null} Location object or null if not found
 */
export const getLocationById = (id) => {
  return allLocations.find(location => location.id === parseInt(id));
};

/**
 * Find a location by coordinates
 * @param {number} latitude Latitude
 * @param {number} longitude Longitude
 * @returns {Object|null} Location object or null if not found
 */
export const getLocationByCoordinates = (latitude, longitude) => {
  // Allow for some small variance in the coordinates for matching
  const variance = 0.001;
  
  return allLocations.find(
    location => 
      Math.abs(location.latitude - latitude) < variance &&
      Math.abs(location.longitude - longitude) < variance
  );
};

/**
 * Get location name from coordinates
 * @param {number} latitude Latitude
 * @param {number} longitude Longitude
 * @returns {string} Location name or "Custom location" if not found
 */
export const getLocationNameFromCoordinates = (latitude, longitude) => {
  if (!latitude || !longitude) return "No location";
  
  const location = getLocationByCoordinates(latitude, longitude);
  return location ? location.name : "Custom location";
};

/**
 * Calculate distance between two points using the Haversine formula
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // Distance in km
};