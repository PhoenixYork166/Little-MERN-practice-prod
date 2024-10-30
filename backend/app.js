const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { mongoose_uri } = require('./util/database');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const rootDir = require('./util/path');
require('dotenv').config({ path: `${rootDir}/.env`});

const { printDateTime } = require('./util/printDateTime');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use(cors());
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

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
