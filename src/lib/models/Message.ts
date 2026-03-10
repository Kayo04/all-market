import mongoose, { Schema, models } from 'mongoose';

const MessageSchema = new Schema(
    {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        requestId: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
        content: { type: String, required: true, trim: true },
        readAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Indexes for fast lookups
MessageSchema.index({ requestId: 1, createdAt: 1 });
MessageSchema.index({ receiverId: 1, readAt: 1 });
MessageSchema.index({ senderId: 1, receiverId: 1, requestId: 1 });

const Message = models.Message || mongoose.model('Message', MessageSchema);
export default Message;
