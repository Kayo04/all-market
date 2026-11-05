import mongoose, { Schema, models } from 'mongoose';

export const REPORT_REASONS = ['scam', 'illegal', 'offensive', 'spam', 'fake', 'other'] as const;
export const REPORT_TARGETS = ['request', 'proposal', 'user'] as const;

// A report of content or an account (EU Digital Services Act, art. 16). The
// snapshot keeps what was reported, so the admin sees it even if it is edited or
// removed later. Both the reporter and the content owner are told the decision.
const ReportSchema = new Schema(
    {
        reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        targetType: { type: String, enum: REPORT_TARGETS, required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        // The account responsible for the target (request author, proposal's pro, or the user itself).
        targetOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        targetSnapshot: { type: String, default: '' },
        reason: { type: String, enum: REPORT_REASONS, required: true },
        details: { type: String, default: '', trim: true },
        status: { type: String, enum: ['open', 'dismissed', 'actioned'], default: 'open' },
        action: { type: String, enum: ['none', 'removed', 'suspended'], default: 'none' },
        adminMessage: { type: String, default: '' },
        resolvedAt: { type: Date },
        resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

ReportSchema.index({ status: 1, createdAt: 1 });
ReportSchema.index({ reporterId: 1, targetId: 1, status: 1 });

const Report = models.Report || mongoose.model('Report', ReportSchema);
export default Report;
