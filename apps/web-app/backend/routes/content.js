const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Content = require('../models/Content');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/content
// @desc    Get all content (with filters)
// @access  Public
router.get('/', async (req, res, next) => {
    try {
        const { status, category, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

        // Build query
        const query = {};

        // Filter by status (only published for non-authenticated users)
        if (req.user) {
            if (status) query.status = status;
        } else {
            query.status = 'published';
        }

        if (category) query.category = category;

        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query
        const content = await Content.find(query)
            .populate('author', 'name username avatar')
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count
        const total = await Content.countDocuments(query);

        res.json({
            success: true,
            data: content,
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

// @route   GET /api/content/:id
// @desc    Get single content by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
    try {
        const content = await Content.findById(req.params.id)
            .populate('author', 'name username avatar');

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Only allow viewing published content for non-authenticated users
        if (!req.user && content.status !== 'published') {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Increment views
        content.views += 1;
        await content.save();

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/content
// @desc    Create new content
// @access  Private (Author, Editor, Admin)
router.post('/', protect, authorize('author', 'editor', 'admin'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').isIn(['blog', 'news', 'tutorial', 'announcement', 'other']).withMessage('Invalid category')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const contentData = {
            ...req.body,
            author: req.user._id
        };

        const content = await Content.create(contentData);

        // Populate author
        await content.populate('author', 'name username avatar');

        res.status(201).json({
            success: true,
            message: 'Content created successfully',
            data: content
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/content/:id
// @desc    Update content
// @access  Private (Author of content, Editor, Admin)
router.put('/:id', protect, authorize('author', 'editor', 'admin'), [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        let content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Check ownership (authors can only edit their own content)
        if (req.user.role === 'author' && content.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this content'
            });
        }

        content = await Content.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('author', 'name username avatar');

        res.json({
            success: true,
            message: 'Content updated successfully',
            data: content
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private (Author of content, Admin)
router.delete('/:id', protect, authorize('author', 'editor', 'admin'), async (req, res, next) => {
    try {
        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Check ownership (authors can only delete their own content)
        if (req.user.role === 'author' && content.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this content'
            });
        }

        await content.deleteOne();

        res.json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/content/stats/dashboard
// @desc    Get content statistics for dashboard
// @access  Private
router.get('/stats/dashboard', protect, async (req, res, next) => {
    try {
        const stats = {
            total: await Content.countDocuments(),
            published: await Content.countDocuments({ status: 'published' }),
            draft: await Content.countDocuments({ status: 'draft' }),
            archived: await Content.countDocuments({ status: 'archived' }),
            byCategory: await Content.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]),
            totalViews: await Content.aggregate([
                { $group: { _id: null, total: { $sum: '$views' } } }
            ])
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
