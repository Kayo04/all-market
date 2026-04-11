import mongoose, { Schema, models } from 'mongoose';

const RequestSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        subcategory: { type: String, required: true },
        // fixedPrice: the exact amount the Needer will pay — first Pro to accept wins
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
        // Urgency: 'urgent' = I need this NOW. 'standard' = can wait
        urgency: {
            type: String,
            enum: ['urgent', 'standard'],
            default: 'standard',
        },
        // intentConfirmed: Needer ticked "I confirm I have the budget and will pay"
        intentConfirmed: { type: Boolean, default: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        // acceptedByProId: set atomically when a Pro accepts — can't be overwritten
        acceptedByProId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        isFeatured: { type: Boolean, default: false },
        // Equipment-specific fields (kept for future expansion)
        itemCondition: {
            type: String,
            enum: ['new', 'used', 'any'],
            default: undefined,
        },
        acceptsTrades: { type: Boolean, default: undefined },
    },
    { timestamps: true }
);

// Critical: 2dsphere index for geo-queries ($nearSphere, $geoWithin)
RequestSchema.index({ location: '2dsphere' });
RequestSchema.index({ category: 1, status: 1 });
RequestSchema.index({ userId: 1 });
RequestSchema.index({ isFeatured: -1, createdAt: -1 });
RequestSchema.index({ urgency: 1, createdAt: -1 });

const Request = models.Request || mongoose.model('Request', RequestSchema);
export default Request;
