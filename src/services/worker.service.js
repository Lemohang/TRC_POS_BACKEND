const Worker = require("../models/worker.model");

const createWorker = async (workerData) => {
  const { name, phone, role } = workerData;

  const existingPhone = phone
    ? await Worker.findOne({ phone })
    : null;

  if (existingPhone) {
    throw new Error("Phone number already exists.");
  }

  return await Worker.create({
    name,
    phone,
    role,
  });
};

const getAllWorkers = async () => {
  return await Worker.find().sort({ createdAt: -1 });
};

const getWorkerById = async (id) => {
  const worker = await Worker.findById(id);

  if (!worker) {
    throw new Error("Worker not found.");
  }

  return worker;
};

const updateWorker = async (id, workerData) => {
  const worker = await Worker.findById(id);

  if (!worker) {
    throw new Error("Worker not found.");
  }

  if (
    workerData.phone &&
    workerData.phone !== worker.phone
  ) {
    const phoneExists = await Worker.findOne({
      phone: workerData.phone,
      _id: { $ne: id },
    });

    if (phoneExists) {
      throw new Error("Phone number already exists.");
    }
  }

  Object.assign(worker, workerData);

  await worker.save();

  return worker;
};

const toggleWorkerStatus = async (id) => {
  const worker = await Worker.findById(id);

  if (!worker) {
    throw new Error("Worker not found.");
  }

  worker.active = !worker.active;

  await worker.save();

  return worker;
};

const deleteWorker = async (id) => {
  const worker = await Worker.findById(id);

  if (!worker) {
    throw new Error("Worker not found.");
  }

  worker.active = false;

  await worker.save();

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