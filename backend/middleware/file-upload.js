const express = require('express');
const multer = require('multer');
const uuid = require('uuid/v1'); // Ensure correct import for UUID
const path = require('path');

// Mapping for file types
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};
const uploadImagePath = path.join('uploads', 'images');

/** multer = a group of middlewares **/
const fileUpload = multer({
    limits: 2048000, // 2MB file size limit
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            console.log(`\nReceived file from Frontend:`);
            console.log(`\nFile name: ${file.originalname}`);
            console.log(`\nMIME type: ${file.mimetype}`);

            // cb(null, 'uploads/images');
            cb(null, uploadImagePath);            
        }, // destination where the file is stored
        filename: (req, file, cb) => {
            // Handle unknow MIME types
            const ext = MIME_TYPE_MAP[file.mimetype];
            
            const generatedFileName = uuid() + '.' + ext;

            console.log(`\nGenerated file name: ${Date.now()}-${generatedFileName}`);
            console.log(`\nStorage location:\n$${uploadImagePath}\n`);

            cb(null, Date.now() + '-' + generatedFileName); // generating a file.ext with a unique Id
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

