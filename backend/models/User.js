import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: "Hey there! I am using ChatApp.",
    },
    profilePic: {
      type: String,
      default: "", 
    },
    passwordResetOtpHash: {
      type: String,
      default: null,
    },
    passwordResetOtpExpiresAt: {
      type: Date,
      default: null,
    },
    passwordResetSessionTokenHash: {
      type: String,
      default: null,
    },
    passwordResetSessionExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // Automatically creates createdAt and updatedAt fields
);

const User = mongoose.model('User', userSchema);
export default User;
