const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

// GET 
router.get('/', usersController.getUsers);

// POST http://localhost:3011/api/users/signup
router.post(
  '/signup',
  fileUpload.single('image'), // File Upload using 'multer'
  (req, res, next) => {
    if (!req.file) {
      console.error(`\nNo file is received from Frontend to be uploaded\n`);
      return next(new Error(`\nFile upload error\n`));
    }
    next();
  },
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
