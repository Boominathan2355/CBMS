const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create department-specific folder
    const departmentId = req.body.departmentId || req.user?.department || 'general';
    const deptDir = path.join(uploadDir, departmentId);
    
    if (!fs.existsSync(deptDir)) {
      fs.mkdirSync(deptDir, { recursive: true });
    }
    
    cb(null, deptDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Middleware for handling file uploads
const uploadMiddleware = upload.array('attachments', 5);

// Enhanced file upload middleware with error handling
const handleFileUpload = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB per file.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 5 files allowed.'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name for file upload.'
        });
      }
    }
    
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Process uploaded files
    if (req.files && req.files.length > 0) {
      req.uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${req.body.departmentId || req.user?.department || 'general'}/${file.filename}`
      }));
    }
    
    next();
  });
};

// File serving middleware
const serveFiles = (req, res, next) => {
  const filePath = path.join(uploadDir, req.params.departmentId, req.params.filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  
  // Set appropriate headers
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
  };
  
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
};

// File deletion utility
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  return false;
};

// Clean up old files utility
const cleanupOldFiles = (olderThanDays = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const cleanupDirectory = (dir) => {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          cleanupDirectory(filePath);
          // Remove empty directories
          try {
            fs.rmdirSync(filePath);
          } catch (err) {
            // Directory not empty, ignore
          }
        } else if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old file: ${filePath}`);
        }
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };
  
  cleanupDirectory(uploadDir);
};

module.exports = {
  handleFileUpload,
  serveFiles,
  deleteFile,
  cleanupOldFiles,
  uploadDir
};