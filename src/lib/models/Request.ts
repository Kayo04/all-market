import mongoose, { Schema, models } from 'mongoose';

const RequestSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        subcategory: { type: String, required: true },
        budget: { type: Number, required: true, min: 0 },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true },
        },
        locationLabel: { type: String, default: '' },
        status: {
            type: String,
            enum: ['open', 'in_progress', 'closed'],
            default: 'open',
        },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isFeatured: { type: Boolean, default: false },
        // Equipment-specific fields
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

const Request = models.Request || mongoose.model('Request', RequestSchema);
export default Request;
