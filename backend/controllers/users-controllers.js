const { validationResult } = require('express-validator');
const { printDateTime } = require('../util/printDateTime');
const bcrypt = require('bcryptjs');

const HttpError = require('../models/http-error');
const User = require('../models/user');

exports.getUsers = async (req, res, next) => {
  printDateTime();
  const requestHandlerName = `backend/controllers/users-controllers.js\nexports.getUsers`;
  console.log(`\n${requestHandlerName}:\n`);

  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

exports.signup = async (req, res, next) => {
  printDateTime();
  const requestHandlerName = `backend/controllers/users-controllers.js\nexports.signup`;
  console.log(`\n${requestHandlerName}:\n`);

  // Express-validator => Validation Error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`Invalid inputs passed, please check your data.`, 422));
  }

  /* Storing Image file on User who created it */
  const { name, email, password } = req.body;

  // Check if user already exists
  User.findOne({ email: email })
  .then((existingUser) => {
    if (existingUser) {
      return res.status(422).json({
        success: false,
        status: { code: 422 },
        message: `User already exists, please login instead.`
      })
    }

    // Hashing password, 12 salt-round
    return bcrypt.hash(password, 12);
  })
  .then((hashedPassword) => {
    // Create user instance
    const createdUser = new User({
      name,
      email,
      image: req.file.path,
      password: hashedPassword,
      places: []
    });

    return createdUser.save();
  })
  .then((createdUser) => {
    return res.status(201).json({
      user: createdUser.toObject({ getters: true })
    });
  })
  .catch((err) => {
    console.error(`\nError Signing up a user:\n`, err, `\n`);
    return res.status(500).json({
      success: false,
      status: { code: 500 },
      message: `Sign up/Registration failed. Please re-try`
    })
  });

  /* try {} catch {} */
  /*
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.error(`\nError Signing up a user:\n`, err, `\n`);
    const error = new HttpError(`Signing up failed, please try again later.`, 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(`User exists already, please login instead.`, 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(`Could not create user, please try again`, 500);
    return next(error);
  }
  
  // Express -> MongoDB Atlas
  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  */
};

exports.login = async (req, res, next) => {
  printDateTime();
  const requestHandlerName = `backend/controllers/users-controllers.js\nexports.login`;
  console.log(`\n${requestHandlerName}:\n`);

  /* Express-validator => Validation Error */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`Invalid inputs passed, please check your data.`, 422));
  }

  const { email, password } = req.body;

  /* Promise chaining */
  User.findOne({ email: email })
  .then((existingUser) => {
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        status: { code: 401 },
        message: `Invalid credentials, could not log in.`
      });
    }

    // If user could be found using unique e-mail, bcrypt.compare(password, hashedPassword)
    return bcrypt.compare(password, existingUser.password)
    .then((isValidPassword) => { // boolean
      if (!isValidPassword) {
        return res.status(422).json({
          success: false,
          status: { code: 422 },
          message: `Invalid credentials, could not log in.`
        });
      }
      // If password is valid, send response to Frontend
      return res.status(201).json({
        success: true,
        status: { code: 201 },
        user: existingUser.toObject({ getters: true }),
        message: `Logged in!`
      });
    })
    .catch((err) => {
      console.error(`\nError in loggin in user:\nemail: ${email}\n`);
      return res.status(500).json({
        success: false,
        status: { code: 500 },
        message: `Failed to log in user with email: ${email}.`
      });
    })
  });

  /* try{} catch {} */
  /*
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(`Loggin in failed, please try again later.`, 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(`Invalid credentials, could not log you in.`, 401);
    return next(error);
  }

  let isValidPassword = false;
  try {
    // Compare req.body.password === existingUser.password
  isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError(`Could not login.`), 500);
  }
  
  if (!isValidPassword) {
    return next(new HttpError(`Invalid credentials`), 422);
  }

  res.status(201).json({
    message: 'Logged in!',
    user: existingUser.toObject({ getters: true })
  });
  */
};

