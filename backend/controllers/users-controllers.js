const { validationResult } = require('express-validator');
const { printDateTime } = require('../util/printDateTime');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const rootDir = require('../util/path');
require('dotenv').config({ path: `${rootDir}/.env`});

exports.getUsers = async (req, res, next) => {
  printDateTime();
  const requestHandlerName = `backend/controllers/users-controllers.js\nexports.getUsers`;
  console.log(`\n${requestHandlerName}:\n`);

  /* Promise chaining */
  User.find({}, '-password')
  .then((users) => {
    const userObjects = users.map((user) => user.toObject({ getters: true }));
    
    return res.status(201).json({ users: userObjects });
  })
  .catch((err) => {
    console.error(`\nFailed to fetch users, please try again\nError: ${err}\n`);
    return res.status(500).json({
      success: false,
      status: { code: 500 },
      message: `Failed to fetch users, please try again`
    })
  })
  /* try{} catch {}
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
  
  return res.status(201).json({ 
    users: users.map(user => user.toObject({ getters: true })) 
  });
  */
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

  /* Promise chaining */
  User.findOne({ email: email })
  .then((existingUser) => {
    if (existingUser) {
      return res.status(422).json({ success: false, status: { code: 422 }, message: `User already exists, please login instead.` });
    }

    return bcrypt.hash(password, 12); // hasing password, salt-round: 10
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
    let token;
    // jwt.sign(payload(string | object | Buffer), jwtKey, options{});
    token = jwt.sign({
      userId: createdUser.id, // encoding userId
      email: createdUser.email // encoding email
    }, process.env.JWT_SECRET, // .env file storing JWT_SECRET
    { expiresIn: '1h' } // jwt options
    );

    return res.status(201).json({
      success: true, 
      status: { code: 201 },
      // user: createdUser.toObject({ getters: true }),
      user: { userId: createdUser.id, email: createdUser.email, token: token },
      message: `Registered user!`
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

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email }, // encoding userId & email
      process.env.JWT_SECRET, // backend/.env file JWT_SECRET
      { expiresIn: '1h' }
    )
  } catch (err) {
    console.error(`\nFailed to generate a JWT for user being signed up.\nError: ${err}\n`);
    return res.status(500).json({ success: false, status: { code: 500 }, message: `Failed to Sign up a user, please try again.`});
  }

  // return res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
  return res.status(201).json({ 
    success: true,
    status: { code: 201 },
    // user: createdUser.toObject({ getters: true }),
    user: { userId: createdUser.id, email: createdUser.email, token: token },
    message: `Succeeded in signing up a user.`
  });
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
      return res.status(403).json({
        success: false,
        status: { code: 403 },
        message: `Invalid credentials, could not log in.`
      });
    }

    return bcrypt.compare(password, existingUser.password)
    .then((isValidPassword) => { // boolean
      if (!isValidPassword) {
        return res.status(422).json({
          success: false,
          status: { code: 422 },
          message: `Invalid credentials, could not log in.`
        });
      }

      let token;
      // jwt.sign((string | object | Buffer), jwtKey, options{});
      token = jwt.sign({
        userId: existingUser.id, // encoding userId
        email: existingUser.email // encoding email
      }, process.env.JWT_SECRET, // .env file storing JWT_SECRET
      { expiresIn: '1h' } // jwt options
      );

      return res.status(201).json({
        success: true,
        status: { code: 201 },
        // user: existingUser.toObject({ getters: true }),
        user: { userId: existingUser.id, email: existingUser.email, token: token },
        message: `Logged in!`
      });
    })
    .catch((err) => {
      console.error(`\nError in comparing user's hashed password\nemail: ${email}\nError:\n${err}\n`);
      return res.status(500).json({
        success: false,
        status: { code: 500 },
        message: `Failed to log in user with email: ${email}.`
      });
    })
  })
  .catch((err) => {
    console.error(`\nError in logging in a user\nMongoDB operation failed\nemail: ${email}\nError:\n${err}\n`);
      return res.status(500).json({
        success: false,
        status: { code: 500 },
        message: `Failed to log in user with email: ${email}.`
    });
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
    const error = new HttpError(`Invalid credentials, could not log you in.`, 403);
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

