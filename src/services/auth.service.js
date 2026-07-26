const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Register a new user
 */
const registerUser = async (userData) => {
 const { name, username, email, password, role } = userData;

  const existingUser = await User.findOne({
  $or: [
    { email: email.toLowerCase() },
    { username },
  ],
});

if (existingUser) {
  throw new Error("Email or username already exists.");
}
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
  name,
  username,
  email: email.toLowerCase(),
  password: hashedPassword,
  role,
});
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
  token,
  user: {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  },
};
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Get current user
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};