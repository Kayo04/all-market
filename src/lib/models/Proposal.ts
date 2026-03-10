import mongoose, { Schema, models } from 'mongoose';

const ProposalSchema = new Schema(
    {
        requestId: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
        proId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

ProposalSchema.index({ requestId: 1 });
ProposalSchema.index({ proId: 1 });

const Proposal = models.Proposal || mongoose.model('Proposal', ProposalSchema);
export default Proposal;
