import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-hashedPassword");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({ message: "Failed to fetch current user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.userId;
    // Saare users fetch karein sivay logged-in user ke
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-hashedPassword");
    return res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};
