const { deleteFile, cleanupOldFiles } = require('../middleware/fileUpload');
const path = require('path');

// @desc    Upload files for expenditure
// @route   POST /api/files/upload
// @access  Private
const uploadFiles = async (req, res) => {
  try {
    const uploadedFiles = req.uploadedFiles || [];

    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const response = {
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    };

    // Include virus scan results if available
    if (req.virusScanResults) {
      response.data.virusScan = req.virusScanResults;

      if (req.virusScanResults.skipped > 0) {
        response.message += ' (virus scanning skipped in dev mode)';
      } else {
        response.message += ' and scanned for viruses';
      }
    }

    res.json(response);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
};

// @desc    Get file information
// @route   GET /api/files/:fileId
// @access  Private
const getFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;

    // In a real implementation, you'd query the database for file metadata
    // For now, return mock data
    res.json({
      success: true,
      data: {
        fileId,
        filename: 'sample-file.pdf',
        originalName: 'Bill Document.pdf',
        mimetype: 'application/pdf',
        size: 1024000,
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.user.id
      }
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file information'
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:fileId
// @access  Private
const deleteFileById = async (req, res) => {
  try {
    const { fileId } = req.params;

    // In a real implementation, you'd:
    // 1. Query database for file path
    // 2. Delete file from storage
    // 3. Remove database record

    // For now, return success
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
};

// @desc    Get file download URL
// @route   GET /api/files/:fileId/download
// @access  Private
const getDownloadUrl = async (req, res) => {
  try {
    const { fileId } = req.params;

    // In a real implementation, you'd generate a signed URL for S3
    // For now, return a mock URL
    res.json({
      success: true,
      data: {
        downloadUrl: `/api/files/serve/${req.user.department}/${fileId}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
      }
    });
  } catch (error) {
    console.error('Get download URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate download URL'
    });
  }
};

// @desc    Cleanup old files
// @route   POST /api/files/cleanup
// @access  Private (Admin only)
const cleanupFiles = async (req, res) => {
  try {
    const { olderThanDays = 30 } = req.body;

    cleanupOldFiles(olderThanDays);

    res.json({
      success: true,
      message: `Cleaned up files older than ${olderThanDays} days`
    });
  } catch (error) {
    console.error('Cleanup files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup files'
    });
  }
};

// @desc    Get file statistics
// @route   GET /api/files/stats
// @access  Private (Admin only)
const getFileStats = async (req, res) => {
  try {
    // In a real implementation, you'd query the database for statistics
    res.json({
      success: true,
      data: {
        totalFiles: 15,
        totalSize: '25.6 MB',
        filesByType: {
          pdf: 8,
          jpg: 4,
          png: 3
        },
        filesByDepartment: {
          'dept1': 5,
          'dept2': 4,
          'dept3': 6
        },
        oldestFile: '2024-01-15T10:30:00Z',
        newestFile: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get file stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file statistics'
    });
  }
};

module.exports = {
  uploadFiles,
  getFileInfo,
  deleteFileById,
  getDownloadUrl,
  cleanupFiles,
  getFileStats
};
