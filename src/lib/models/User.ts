import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['client', 'pro'], default: 'client', required: true },
        isVerified: { type: Boolean, default: false },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },
        locationLabel: { type: String, default: '' },
        avatar: { type: String, default: '' },
        bio: { type: String, default: '' },
        skills: [{ type: String }],
        ratings: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                score: { type: Number, min: 1, max: 5 },
                comment: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        verificationStatus: {
            type: String,
            enum: ['none', 'pending', 'approved', 'rejected'],
            default: 'none',
        },
        verificationData: {
            businessName: { type: String },
            taxId: { type: String },
            website: { type: String },
            submittedAt: { type: Date },
        },
    },
    { timestamps: true }
);

UserSchema.index({ location: '2dsphere' });

const User = models.User || mongoose.model('User', UserSchema);
export default User;
