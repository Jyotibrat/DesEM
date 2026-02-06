const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['image', 'video', 'document', 'other'],
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    alt: {
        type: String,
        default: ''
    },
    caption: {
        type: String,
        default: ''
    },
    metadata: {
        width: Number,
        height: Number,
        duration: Number
    }
}, {
    timestamps: true
});

// Determine file type from MIME type
mediaSchema.pre('save', function (next) {
    if (this.mimeType.startsWith('image/')) {
        this.type = 'image';
    } else if (this.mimeType.startsWith('video/')) {
        this.type = 'video';
    } else if (this.mimeType.includes('pdf') || this.mimeType.includes('document')) {
        this.type = 'document';
    } else {
        this.type = 'other';
    }
    next();
});

module.exports = mongoose.model('Media', mediaSchema);
