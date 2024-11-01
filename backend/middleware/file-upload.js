const multer = require('multer');
const uuid = require('uuid');

// Mapping for file types
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

// multer = a group of middlewares
const fileUpload = multer({
    limits: 2048000, // 2MB
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images');

        }, // destination where the file is stored
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, uuid() + '.' + ext); // generating a file.ext with a unique Id
        }
    }),
    // Adding file.ext filter
    fileFilter: (req, file, cb) => {
        // Filter out by mapping mime type for file.ext
        const isValid = !!MIME_TYPE_MAP[file.mimetype]; // true || false
        
        let error = isValid ? null : new Error(`\nInvalid MIME_TYPE for file!\n`);

        cb(error, isValid);
    }
});

module.exports = fileUpload;