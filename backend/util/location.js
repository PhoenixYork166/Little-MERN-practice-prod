const axios = require('axios');

const HttpError = require('../models/http-error');

const rootDir = require('./path');
require('dotenv').config({ path: `${rootDir}/.env`});

async function getCoordsForAddress(address) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.API_KEY}`
    );

    const data = response.data;

    console.log(`\nAPI_KEY:\n`, process.env.API_KEY, `\n`);

    // Logging for debugging purposes
    console.log(`\nResponse for src/util/location\ngetCoordsForAddress(${address}):\n`, data.results[0], `\n`);

    if (!data || data.status === 'ZERO_RESULTS') {
      const error = new HttpError('Could not find location for the specified address.', 422);
      throw error;
    }

    const coordinates = data.results[0].geometry.location;

    if (!coordinates) {
      console.error(`\nFailed to retrieve Location coordinates: ${coordinates}\n`);
    }
    console.log(`\nbackend/util/location.js\ncoordinates:\n`, coordinates, `\n`);

    return coordinates;
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
