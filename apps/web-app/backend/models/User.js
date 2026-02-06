const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    supabaseId: {
        type: String,
        unique: true,
        sparse: true, // Allow null values but ensure uniqueness when present
        index: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Allow null but ensure uniqueness when present
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        // Not required when using Supabase auth
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'author', 'viewer'],
        default: 'author'
    },
    avatar: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving (only if password is provided)
userSchema.pre('save', async function (next) {
    // Skip if password is not present or not modified
    if (!this.password || !this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
