import Message from '../models/Message.js';
import cloudinary from '../config/cloudinary.js';

// ⚡ Socket Implementation Import
import { getReceiverSocketId, io } from '../socket/socket.js';

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate: must have text or image
    if (!text?.trim() && !image) {
      return res.status(400).json({ message: 'Message must contain text or an image' });
    }

    // Prevent messaging yourself
    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({ message: 'Cannot send messages to yourself' });
    }

    let imageUrl = "";
    let fileType = "";
    let fileName = "";

    if (image) {
      // Extract MIME type from base64 data URI: "data:application/pdf;base64,..."
      const mimeMatch = image.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      fileType = mimeType;

      const isDocument = !mimeType.startsWith('image/');

      if (isDocument) {
        fileName = text?.trim() || 'document';

        // Cloudinary free plan returns 401 for raw file delivery.
        // Store documents as base64 data URIs — browser opens them natively via blob URL.
        const base64Size = image.length * 0.75; // approximate decoded bytes
        if (base64Size > 5 * 1024 * 1024) {
          return res.status(400).json({ message: 'Document too large. Max 5MB.' });
        }
        imageUrl = image; // store the raw base64 data URI directly
      } else {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          resource_type: 'image',
        });
        imageUrl = uploadResponse.secure_url;
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      // For documents: text holds the caption (if any), fileName holds the original name
      // For images: text holds the caption (if any)
      // For plain text: text holds the message
      text: fileType && !fileType.startsWith('image/') ? '' : (text?.trim() || ""),
      image: imageUrl,
      fileType,
      fileName,
    });

    await newMessage.save();

    // ⚡ REAL-TIME SOCKET ALGORITHM:
    // 1. Look up if the person we are texting is actively online using our hashmap lookup
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      // 2. Direct beam the newly saved message STRICTLY to their specific browser tab instantly
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; 
    const myId = req.user._id;

    // Intelligent query: Find messages where I sent to them, OR they sent to me
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // 1 = Ascending order (oldest messages at top, newest at bottom)

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

