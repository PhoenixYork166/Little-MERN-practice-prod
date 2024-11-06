const rootDir = require('../util/path');
require('dotenv').config({ path: `${rootDir}/.env`});

// exports.mongoose_uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.ct1vs.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority&appName=Cluster0`;

exports.mongoose_uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.ct1vs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// exports.mongoose_uri = mongoose_uri;
