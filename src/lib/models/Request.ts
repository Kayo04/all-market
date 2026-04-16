import mongoose, { Schema, models } from 'mongoose';

const RequestSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        subcategory: { type: String, required: true },
        // budget: the general max. fixedPrice: the exact Uber-style amount.
        budget: { type: Number, required: true, min: 0 },
        fixedPrice: { type: Number, min: 0 },
        type: {
            type: String,
            enum: ['service', 'product'],
            default: 'service',
        },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true },
        },
        locationLabel: { type: String, default: '' },
        status: {
            type: String,
            enum: ['open', 'accepted', 'in_progress', 'closed'],
            default: 'open',
        },
        // v2.0 urgency — replaces old 'urgent'/'standard' values
        urgency: {
            type: String,
            enum: ['Normal', 'High', 'Urgent'],
            default: 'Normal',
        },
        // AI-extracted tags for matching (e.g. ['electrician', 'porto', 'urgent'])
        aiTags: [{ type: String }],
        // Sniper Bidding: non-premium users cannot see requests before this date (createdAt + 1h)
        // Default factory sets it automatically on creation — no pre-save hook needed.
        publicReleaseDate: {
            type: Date,
            default: () => new Date(Date.now() + 60 * 60 * 1000),
        },
        // From v1 Uber pivot — intent confirmation before posting
        intentConfirmed: { type: Boolean, default: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        // Instant-accept: set atomically via /api/requests/[id]/accept
        acceptedByProId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        isFeatured: { type: Boolean, default: false },
        // Product-specific fields (kept for future expansion)
        itemCondition: {
            type: String,
            enum: ['new', 'used', 'any'],
            default: undefined,
        },
        acceptsTrades: { type: Boolean, default: undefined },
    },
    { timestamps: true }
);


RequestSchema.index({ location: '2dsphere' });
RequestSchema.index({ category: 1, status: 1 });
RequestSchema.index({ userId: 1 });
RequestSchema.index({ isFeatured: -1, createdAt: -1 });
RequestSchema.index({ urgency: 1, createdAt: -1 });
RequestSchema.index({ publicReleaseDate: 1, status: 1 }); // Sniper bidding filter
RequestSchema.index({ aiTags: 1 });                        // AI tag matching

const Request = models.Request || mongoose.model('Request', RequestSchema);
export default Request;
