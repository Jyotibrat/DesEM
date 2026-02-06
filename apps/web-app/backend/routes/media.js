const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');
const { protect } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || './uploads';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
    },
    fileFilter
});

// @route   POST /api/media/upload
// @desc    Upload media file
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const { alt, caption } = req.body;

        const media = await Media.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            url: `/uploads/${req.file.filename}`,
            uploadedBy: req.user._id,
            alt: alt || '',
            caption: caption || ''
        });

        await media.populate('uploadedBy', 'name username');

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: media
        });
    } catch (error) {
        // Delete file if database save fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
});

// @route   POST /api/media/upload-multiple
// @desc    Upload multiple media files
// @access  Private
router.post('/upload-multiple', protect, upload.array('files', 10), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one file'
            });
        }

        const mediaPromises = req.files.map(file => {
            return Media.create({
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                path: file.path,
                url: `/uploads/${file.filename}`,
                uploadedBy: req.user._id
            });
        });

        const mediaFiles = await Promise.all(mediaPromises);

        // Populate uploaded by
        await Media.populate(mediaFiles, { path: 'uploadedBy', select: 'name username' });

        res.status(201).json({
            success: true,
            message: `${mediaFiles.length} file(s) uploaded successfully`,
            data: mediaFiles
        });
    } catch (error) {
        // Delete files if database save fails
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        next(error);
    }
});

// @route   GET /api/media
// @desc    Get all media files
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { type, page = 1, limit = 20, sort = '-createdAt' } = req.query;

        const query = {};
        if (type) query.type = type;

        const skip = (page - 1) * limit;

        const media = await Media.find(query)
            .populate('uploadedBy', 'name username')
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Media.countDocuments(query);

        res.json({
            success: true,
            data: media,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/media/:id
// @desc    Get single media file
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const media = await Media.findById(req.params.id)
            .populate('uploadedBy', 'name username avatar');

        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media file not found'
            });
        }

        res.json({
            success: true,
            data: media
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/media/:id
// @desc    Update media metadata
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        const { alt, caption } = req.body;

        let media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media file not found'
            });
        }

        const updateData = {};
        if (alt !== undefined) updateData.alt = alt;
        if (caption !== undefined) updateData.caption = caption;

        media = await Media.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('uploadedBy', 'name username');

        res.json({
            success: true,
            message: 'Media updated successfully',
            data: media
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/media/:id
// @desc    Delete media file
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media file not found'
            });
        }

        // Delete file from filesystem
        if (fs.existsSync(media.path)) {
            fs.unlinkSync(media.path);
        }

        await media.deleteOne();

        res.json({
            success: true,
            message: 'Media file deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
