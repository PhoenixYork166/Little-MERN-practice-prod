const axios = require('axios');

const HttpError = require('../models/http-error');

const rootDir = require('../util/path');
require('dotenv').config({ path: `${rootDir}/.env`});

async function placeIdToImageUrl(placeId) {

  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photo&key=${process.env.API_KEY}`
  );

  console.log(`\nResponse for src/util/placeIdToImageUrl\n:\n`, response, `\n`);

//   const data = response.data;

//   if (!data || data.status === 'ZERO_RESULTS') {
//     const error = new HttpError(
//       'Could not find location for the specified address.',
//       422
//     );
//     throw error;
//   }

  return response;
};

module.exports = { placeIdToImageUrl };
