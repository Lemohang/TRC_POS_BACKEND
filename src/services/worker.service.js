const bcrypt = require('bcrypt');

const Worker = require('../models/worker.model');
const User = require('../models/user.model');

/**
 * Create cashier account + worker profile
 */
const createWorker = async (workerData) => {
  const { name, phone, email, password } = workerData;

  // Check existing user email

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error('Email already exists.');
  }

  // Check existing phone

  if (phone) {
    const existingWorker = await Worker.findOne({
      phone,
    });

    if (existingWorker) {
      throw new Error('Phone number already exists.');
    }
  }

  // Hash password

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create login account

  const user = await User.create({
    name,

    email: email.toLowerCase(),

    password: hashedPassword,

    role: 'cashier',
  });

  // Create worker profile

  const worker = await Worker.create({
    name,

    phone,

    user: user._id,

    active: true,
  });

  return worker;
};

/**
 * Get all workers
 */
const getAllWorkers = async () => {
  return await Worker.find({
    active: true,
  })
    .populate('user', 'email role')
    .sort({
      createdAt: -1,
    });
};

/**
 * Get worker by id
 */
const getWorkerById = async (id) => {
  const worker = await Worker.findById(id).populate('user', 'email role');

  if (!worker) {
    throw new Error('Worker not found.');
  }

  return worker;
};

/**
 * Update worker
 */
const updateWorker = async (id, workerData) => {
  const worker = await Worker.findById(id);

  if (!worker) {
    throw new Error('Worker not found.');
  }

  if (workerData.phone && workerData.phone !== worker.phone) {
    const phoneExists = await Worker.findOne({
      phone: workerData.phone,

      _id: {
        $ne: id,
      },
    });

    if (phoneExists) {
      throw new Error('Phone number already exists.');
    }
  }

  Object.assign(worker, workerData);

  await worker.save();

  return worker;
};

/**
 * Enable / Disable worker
 */
const toggleWorkerStatus = async (id) => {
  const worker = await Worker.findById(id);

  if (!worker) {
    throw new Error('Worker not found.');
  }

  worker.active = !worker.active;

  await worker.save();

  return worker;
};

/**
 * Soft delete worker
 */
const deleteWorker = async (id) => {
  const worker = await Worker.findById(id);

  if (!worker) {
    throw new Error('Worker not found.');
  }

  await User.findByIdAndDelete(worker.user);

  await Worker.findByIdAndDelete(id);

  return worker;
};

module.exports = {
  createWorker,

  getAllWorkers,

  getWorkerById,

  updateWorker,

  toggleWorkerStatus,

  deleteWorker,
};
