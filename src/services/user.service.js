const bcrypt = require("bcrypt");
const User = require("../models/user.model");

/**
 * Create a new user
 */
const createUser = async (userData) => {
  const { name, username, email, password, role } = userData;

  // Check if username already exists
  const usernameExists = await User.findOne({ username });

  if (usernameExists) {
    throw new Error("Username already exists.");
  }

  // Check if email already exists
  const emailExists = await User.findOne({
    email: email.toLowerCase(),
  });

  if (emailExists) {
    throw new Error("Email already exists.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    username,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
  });

  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

/**
 * Get all users
 */
const getAllUsers = async () => {
  return await User.find().sort({ createdAt: -1 });
};

/**
 * Get user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

/**
 * Update user
 */
const updateUser = async (id, data) => {
  // Don't allow password updates here
  delete data.password;

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

/**
 * Change password
 */
const changePassword = async (id, currentPassword, newPassword) => {
  const user = await User.findById(id).select("+password");

  if (!user) {
    throw new Error("User not found.");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new Error("Current password is incorrect.");
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  return true;
};

/**
 * Activate/Deactivate user
 */
const toggleUserStatus = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found.");
  }

  user.isActive = !user.isActive;

  await user.save();

  return user;
};

/**
 * Delete user
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new Error("User not found.");
  }

  return true;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  toggleUserStatus,
  deleteUser,
};