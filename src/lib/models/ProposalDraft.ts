import mongoose, { Schema, models } from 'mongoose';

const ProposalDraftSchema = new Schema(
    {
        proId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true },
        defaultPrice: { type: Number, min: 0 },
        category: { type: String, default: '' },
    },
    { timestamps: true }
);

ProposalDraftSchema.index({ proId: 1 });

const ProposalDraft = models.ProposalDraft || mongoose.model('ProposalDraft', ProposalDraftSchema);
export default ProposalDraft;
