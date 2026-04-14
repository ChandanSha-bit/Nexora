import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "", // MIME type e.g. "application/pdf", "image/png"
    },
    fileName: {
      type: String,
      default: "", // Original filename for documents
    },
  },
  { timestamps: true } // Super important so we can sort chats chronologically!
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
