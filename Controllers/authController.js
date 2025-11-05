import User from "../models/UserSchema.js";
import Admin from "../models/AdminSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },

    process.env.JWT_SECRET_KEY, // Changed to JWT_SECRET_KEY for consistency
    { expiresIn: "24h" }
  );
};

// User registration
export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user based on role
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res
      .status(201)
      .json({ success: true, message: "User Created Successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again",
    });
  }
};

// User login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;
    // Find user in both collections
    const viewer = await User.findOne({ email });
    const admin = await Admin.findOne({ email });
    if (viewer) {
      user = viewer;
    } else if (admin) {
      user = admin;
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials" });
    }

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Destructure the user object to exclude sensitive information
    const { password, role, ...rest } = user._doc;
    console.log(token);

    res.status(200).json({
      status: true,
      message: "Successfully logged in",
      token,
      data: { ...rest },
      role,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ status: false, message: "Failed to log in" });
  }
};

// User Logout
export const logout = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Logged Out Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
