const uuid = require('uuid/v4');

// For also deleting the Image Uploaded by Users
const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

const { printDateTime } = require('../util/printDateTime');
const Place = require('../models/place');
const User = require('../models/user');

exports.getPlaceById = async (req, res, next) => {
  printDateTime();
  const requestHandlerName = `backend/controllers/places-controllers/getPlaceById`;
  console.log(`\n${requestHandlerName}`);
  const placeId = req.params.pid;

  if (!placeId) {
    return res.status(422).json({
      success: false,
      status: { code: 422 },
      message: `Undefined placeId: ${placeId}`
    });
  }

  /* Promise chaining */
  Place.findById(placeId)
  .then((place) => {
    if (!place) {
      return res.status(404).json({
        success: false,
        status: { code: 404 },
        message: `Could not find place for provided placeId: ${placeId}`
      });
    }

    return res.status(201).json({
      success: true,
      status: { code: 201 },
      place: place.toObject({ getters: true }),
      message: `Place found using placeId: ${placeId}`
    })
  })
  .catch((err) => {
    console.error(`\nFailed to find the place\nplaceId: ${placeId}\nError: ${err}\n`);
    return res.status(500).json({
      success: false,
      status: { code: 500 },
      message: `Failed to find the place with placeId: ${placeId}`
    })
  });

  /* try{} catch {}
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    );
    return next(error);
  }

  return res.status(201).json({ place: place.toObject({ getters: true }) });
  */
};

// GET http://localhost:3011/api/places/user/:uid
exports.getPlacesByUserId = async (req, res, next) => {
  printDateTime();
  const requestHandlerName = `backend/controllers/places-controllers/getPlaceByUserId`;
  console.log(`\n${requestHandlerName}`);
  const userId = req.params.uid;

  if (!userId) {
    return res.status(422).json({
      success: false,
      status: { code: 422 },
      message: `Undefined userId: ${userId}`
    });
  }

  /* Promise chaining */
  User.findById(userId).populate('places')
  .then((userWithPlaces) => {
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
      return res.status(404).json({
        success: false,
        status: { code: 404 },
        message: `Could not find places for the provided userId: ${userId}`
      });
    }
    console.log(`\nuserWithPlaces:\n${userWithPlaces}\n`);
    return res.status(201).json({
      success: true,
      status: { code: 201 },
      places: userWithPlaces.places.map((place) => {
        return place.toObject({ getters: true })
      }),
      message: `Found places for the provided userId: ${userId}`
    });
  })
  .catch((err) => {
    console.error(`\nFailed to fetch places, please try again\nError: ${err}\n`);
    return res.status(500).json({
      success: false,
      status: { code: 500 },
      message: `Failed to fetch places, please try again`
    });
  });

  /* try{} catch{} 
  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  return res.status(201).json({ 
    places: userWithPlaces.places.map(place => place.toObject({ getters: true })) 
  });
  */
};

// POST http://localhost:3011/api/places
exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    console.error(err.message);
    console.error(`\ncoordinates:\n`, coordinates, `\n`);
    return next(new HttpError('Failed to find location for the provided address.', 500));
  }

  // Instantiate class Place{}
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);

    if (!user) {
      const error = new HttpError('Could not find user for provided id.', 404);
      return next(error);
    }
  } catch (err) {
    console.error(err);
    return next(new HttpError('Creating place failed, please try again.', 500));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.error(err.message);
    return next(new HttpError('Creating place failed, please try again.', 500));
  }

  return res.status(201).json({ 
    success: true,
    status: { code: 201 },
    place: createdPlace,
    message: `A new place has been created.`
  });
};

// PATCH http://localhost:3011/api/places/:pid
exports.updatePlace = async (req, res, next) => {
  printDateTime();
  const requestHandlerName = `updatePlace`;
  console.log(`\n${requestHandlerName}`);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  if (!title || !description || !placeId) {
    return res.status(422).json({ success: false, status: { code: 422 }, message: `Invalid inputs`});
  }

  Place.findById(placeId)
    .then((place) => {
      if (!place) {
        return res.status(500).json({ success: false, status: { code: 500 }, message: `Could not find a place for placeId: ${placeId}`});
      }
      
      // JWT Authorization checks
      if (place.creator.toString() !== req.userData.userId) {
        return res.status(403).json({ success: false, status: { code: 403 }, message: `Forbidden to edit this place created by others`});
      }

      place.title = title;
      place.description = description;

      return place.save();
    })
    .then((updatedPlace) => {
      return res.status(201).json({ 
        success: true, 
        status: { code: 201 }, 
        place: updatedPlace.toObject({ getters: true}),
        message: `Place has been updated.`
      });
    })
    .catch((err) => {
      console.error(`\nError in updating a place\nplaceId: ${placeId}\nError: ${err}\n`);
      return res.status(501).json({
        success: false,
        status: { code: 501 },
        message: `Failed to update a place - placeId: ${placeId}`
      })
    })
  /* try{} catch {}
  let place;
  try {
    place = await Place.findById(placeId);
    if (!place) {
      return res.status(500).json({ success: false, status: { code: 500 }, message: `Could not find a place for the provided placeId: ${placeId}`});
    }
  } catch (err) {
    console.error(err);
    return next(new HttpError('Something went wrong, could not update place.', 500));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return res.status(403).json({ success: false, status: { code: 403 }, message: `Not allowed to edit this place created by others.`})
  }
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Something went wrong, could not update place.', 500));
  }

  return res.status(201).json({ 
    sucess: true,
    status: { code: 201 },
    place: place.toObject({ getters: true }),
    message: `Place has been updated.` 
  });
  */
};

// DELETE http://localhost:3011/api/places/:pid
exports.deletePlace = async (req, res, next) => {
  printDateTime();
  const requestHandlerName = `backend/controllers/place-controllers/deletePlace`;
  console.log(`\n${requestHandlerName}`);

  const placeId = req.params.pid;

  /* Promise chaining code */
  Place.findById(placeId).populate('creator')
  .then((place) => {
    if (!place) {
      return res.status(404).json({
        success: false,
        status: { code: 404 },
        message: `Unable to find the place with placeId: ${placeId}`
      });
    }

    // JWT Authorization checks
    if (place.creator.id !== req.userData.userId) {
      return res.status(403).json({
        success: false,
        status: { code: 403 },
        message: `Not allowed to delete this place created by others.`
      });
    }

    const sess = mongoose.startSession();
    return sess.then((session) => {
      session.startTransaction();
        
      return place.remove({ session: session })
        .then(() => {
          place.creator.places.pull(place);
          
          return place.creator.save({ session: session });
        })
        .then(() => session.commitTransaction())
        .then(() => session.endSession())
        .then(() => {
          // Deleting the image from Node.js server inside backend/uploads/images
          const imagePath = place.image;
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error(`\nFailed to delete Image uploaded by User: ${place.creator}\nError: ${err}\n`);
            }
          });

          return res.status(201).json({
            success: true,
            status: { code: 201 },
            message: `Deleted place. placeId: ${placeId}`
          });
        });
    });
  })
  .catch((err) => {
      console.error(`\nError in deleting a place\nplaceId: ${placeId}\nError: ${err}\n`);
      return res.status(501).json({ success: false, status: { code: 501 }, message: `Failed to delete the place with placeId: ${placeId}`});
  });

  /* try{} catch{}
  let place;
  try {
    // .populate('creator') creator field holds the full user{}
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    console.error(err);
    return next(HttpError('Something went wrong, could not delete place.', 500 ));
  }

  if (!place) {
    return next(new HttpError('Could not find place for this id.', 404));
  }

  // JWT Authorization checks
  if (place.creator.id !== req.userData.userId) {
    return res.status(403).json({ success: false, status: { code: 403 }, message: `Not allowed to delete this place created by others.`})
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session: sess}); // Start MongoDB transaction
    place.creator.places.pull(place); // remove target place from User.places[] 
    await place.creator.save({session: sess}); // User.save() to update User.places[]
    await sess.commitTransaction(); // commit transaction
  } catch (err) {
    console.error(`\nError in deleting a place\nplaceId: ${placeId}\nError: ${err}\n`);
    return next(new HttpError('Something went wrong, could not delete place.', 500));
  }

  // Deleting the image in backend/uploads/images
  const imagePath = place.image;
  fs.unlink(imagePath, (err) => {
    console.error(`\nFailed to delete Image uploaded by User: ${place.creator}\nError: ${err}\n`);
  });
  
  return res.status(201).json({ 
    success: true, 
    status: { code: 201 },
    message: `Deleted place. placeId: ${placeId}` 
  });
  */
};
