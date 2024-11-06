const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

/* Open to public route */
// GET http://localhost:3011/api/places/:pid
router.get('/:pid', placesControllers.getPlaceById);

/* Open to public route */
// GET http://localhost:3011/api/places/user/:uid
router.get('/user/:uid', placesControllers.getPlacesByUserId);

/* Adding a Bearer to all routes below this Middleware */
router.use(checkAuth);

// POST http://localhost:3011/api/places
router.post(
  '/',
  fileUpload.single('image'), // look for req.body.image
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
);

// PATCH http://localhost:3011/api/places/:pid
router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

// DELETE http://localhost:3011/api/places/:pid
router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
