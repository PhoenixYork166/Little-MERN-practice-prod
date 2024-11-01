const axios = require('axios');

const HttpError = require('../models/http-error');

const rootDir = require('../util/path');
require('dotenv').config({ path: `${rootDir}/.env`});

async function getCoordsForAddress(address) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.API_KEY}`
    );

    const data = response.data;

    // Logging for debugging purposes
    console.log(`\nResponse for src/util/location\ngetCoordsForAddress(${address}):\n`, data.results[0], `\n`);

    if (!data || data.status === 'ZERO_RESULTS') {
      throw new HttpError('Could not find location for the specified address.', 422);
    }

    const coordinates = data.results[0].geometry.location;
    const placeId = data.results[0].place_id;

    return { coordinates, placeId };
  } catch (error) {
    if (error.response) {
      // Handle responses with a status code indicating an error
      console.error('Error response from Geocoding API:', error.response.data);
      throw new HttpError('Failed to fetch coordinates from the API.', 500);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new HttpError('No response from the API server.', 500);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
      throw new HttpError(error.message, 500);
    }
  }
};

module.exports = getCoordsForAddress;
