module.exports = (error, req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', '*');
  const isProduction = process.env.NODE_ENV === 'production' ? `https://little-mern-frontend.com` : '*';
  
  res.setHeader('Access-Control-Allow-Origin', isProduction);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
};
