import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error in getUserProfile controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePic } = req.body;
    const userId = req.user._id;

    let updateData = {};
    
    // Validate name if provided
    if (name !== undefined) {
      if (name.trim().length === 0) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      updateData.name = name.trim();
    }
    if (bio !== undefined) updateData.bio = bio;

    // If they supplied a new Profile Picture, push it to Cloudinary
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

