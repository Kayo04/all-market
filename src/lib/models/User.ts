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
        phone: { type: String, default: '' },
        proCategory: { type: String, default: '' },
        skills: [{ type: String }],
        ratings: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                score: { type: Number, min: 1, max: 5 },
                comment: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        // Aggregate rating score — updated on each review for fast AI match queries
        rating: { type: Number, default: 0, min: 0, max: 5 },
        // Monetization: Product sellers who pay for 1-hour early access (Sniper Bidding)
        isPremiumSniper: { type: Boolean, default: false },
        // Monetization: Service pros who pay to appear as #1 Sponsored AI Match
        hasSponsoredSpot: { type: Boolean, default: false },
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
UserSchema.index({ rating: -1 });
UserSchema.index({ hasSponsoredSpot: 1, rating: -1 }); // AI quality gate query
UserSchema.index({ isPremiumSniper: 1 });               // Sniper bidding check

const User = models.User || mongoose.model('User', UserSchema);
export default User;

