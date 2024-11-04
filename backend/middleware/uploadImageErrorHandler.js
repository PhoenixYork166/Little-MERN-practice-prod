const fs = require('fs');

const uploadImageErrorHandler = (error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
      }
      console.log(`\nmulter middleware\nreq.file.path:\n`, req.file.path, `\n`);
    });
  }

  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ success: false, status: { code: 500 }, message: error.message || 'An unknown error occurred!' });
};

module.exports = uploadImageErrorHandler;