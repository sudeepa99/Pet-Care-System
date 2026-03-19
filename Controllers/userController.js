import User from "../models/UserSchema.js";
import Admin from "../models/AdminSchema.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const admins = await Admin.find().select("-password");

    const allUsers = [...users, ...admins];
    res.status(200).json({ success: true, users: allUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
