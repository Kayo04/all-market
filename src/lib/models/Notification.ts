import mongoose, { Schema, models } from 'mongoose';

const NotificationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['new_proposal', 'proposal_accepted', 'new_message', 'system'],
            required: true,
        },
        content: { type: String, required: true },
        readStatus: { type: Boolean, default: false },
        relatedId: { type: Schema.Types.ObjectId },
    },
    { timestamps: true }
);

NotificationSchema.index({ userId: 1, readStatus: 1 });

const Notification = models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;
