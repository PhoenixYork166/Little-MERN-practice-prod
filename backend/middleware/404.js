const HttpError = require('../models/http-error');

const notFoundErrorHandler = (req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
};

module.exports = notFoundErrorHandler;