const multer = require('multer');
const path = require('path');

// Configure multer for CSV file upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Middleware for CSV upload
const handleCSVUpload = upload.single('csvFile');

// Error handling middleware
const handleCSVUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one CSV file is allowed.'
      });
    }
  }
  
  if (err.message === 'Only CSV files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only CSV files are allowed'
    });
  }
  
  next(err);
};

module.exports = {
  handleCSVUpload,
  handleCSVUploadError
};
