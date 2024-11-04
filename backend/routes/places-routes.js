const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

// GET http://localhost:3011/api/places/user/:uid
router.get('/user/:uid', placesControllers.getPlacesByUserId);

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

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
