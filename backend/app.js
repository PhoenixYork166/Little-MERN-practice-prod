const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { mongoose_uri } = require('./util/database');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
/* CORS setup Middleware */
const corsSetup = require('./middleware/cors-setup');
/* uploadImageErrorHandler Middleware */
const uploadImageErrorHandler = require('./middleware/uploadImageErrorHandler');
const notFoundErrorHandler = require('./middleware/404');

const rootDir = require('./util/path');
require('dotenv').config({ path: `${rootDir}/.env`});

const { printDateTime } = require('./util/printDateTime');

const app = express();

// bodyParser
app.use(bodyParser.json({ limit: '100mb' }));

/* Serving Images Statically */
// app.use('/route', middleware) => points to backend/uploads/images folder
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use(corsSetup);
app.use(cors());

/* routes/places-routes.js */
app.use('/api/places', placesRoutes);
/* routes/users-routes.js */
app.use('/api/users', usersRoutes);

/* 404 notFoundErrorHandler Middleware */
app.use(notFoundErrorHandler);

/* uploadImage Error Handler Middleware */
app.use(uploadImageErrorHandler);

const port = process.env.PORT || 3011;

mongoose
  .connect(mongoose_uri)
  .then(() => {
    app.listen(port, () => {
      printDateTime();
      console.log(`\nNode app is up & running on port: ${port}\n`);
    });
  })
  .catch(err => {
    console.log(`Error starting Node app: ${err}\n`);
  });
