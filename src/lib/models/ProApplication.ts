import mongoose, { Schema, models } from 'mongoose';

// An application to become a Pro, reviewed by an admin (owner's rule: becoming a
// Pro is never self-service). One document per user: a resubmission after
// "needs_info" or "rejected" updates it, and `history` keeps every decision.
// Proof documents are not stored yet — they need private storage (see PROGRESS.md);
// once they exist, they are deleted after the decision and only `reviewedAt` stays.
const ProApplicationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        status: {
            type: String,
            enum: ['pending', 'needs_info', 'approved', 'rejected'],
            default: 'pending',
            required: true,
        },
        fullName: { type: String, required: true, trim: true },
        birthDate: { type: Date, required: true },
        phone: { type: String, required: true, trim: true },
        district: { type: String, required: true },
        businessType: { type: String, enum: ['individual', 'company'], required: true },
        nif: { type: String, required: true },
        businessName: { type: String, default: '', trim: true },
        category: { type: String, required: true },
        subcategory: { type: String, default: '' },
        experienceYears: { type: Number, min: 0, max: 70, required: true },
        description: { type: String, required: true, trim: true },
        website: { type: String, default: '' },
        licenseNumber: { type: String, default: '', trim: true },
        submittedAt: { type: Date, required: true },
        adminMessage: { type: String, default: '' },
        reviewedAt: { type: Date },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        history: [
            {
                _id: false,
                status: { type: String },
                message: { type: String },
                at: { type: Date },
                by: { type: Schema.Types.ObjectId, ref: 'User' },
            },
        ],
    },
    { timestamps: true }
);

ProApplicationSchema.index({ status: 1, submittedAt: 1 });

const ProApplication = models.ProApplication || mongoose.model('ProApplication', ProApplicationSchema);
export default ProApplication;
