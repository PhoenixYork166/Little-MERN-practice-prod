const axios = require('axios');

const rootDir = require('./path');
require('dotenv').config({ path: `${rootDir}/.env`});

async function fetchImageUrl(placeId) {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photo&key=${process.env.API_KEY}`;
  
    try {
      // Fetching place details
      const response = await axios.get(detailsUrl);

      const photos = response.data.result.photos;
      if (!photos || photos.length === 0) {
        throw new Error('No photos available for this place.');
      }
  
      // Assuming the first photo is desired
      const photoReference = photos[0].photo_reference;
      const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.API_KEY}`;
  
      return imageUrl;

    } catch (error) {
      console.error('Failed to fetch image URL:', error);
      throw error;
    }
};

module.exports = { fetchImageUrl };