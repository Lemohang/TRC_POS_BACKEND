const workerService = require('../services/worker.service');

const createWorker = async (req, res) => {
  try {
    const worker = await workerService.createWorker(req.body);

    res.status(201).json({
      success: true,
      message: 'Worker created successfully.',
      data: { worker },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllWorkers = async (req, res) => {
  try {
    const workers = await workerService.getAllWorkers();

    res.json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkerById = async (req, res) => {
  try {
    const worker = await workerService.getWorkerById(req.params.id);

    res.json({
      success: true,
      data: worker,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const updateWorker = async (req, res) => {
  try {
    const worker = await workerService.updateWorker(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Worker updated successfully.',
      data: worker,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleWorkerStatus = async (req, res) => {
  try {
    const worker = await workerService.toggleWorkerStatus(req.params.id);

    res.json({
      success: true,
      message: 'Worker status updated.',
      data: worker,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const worker = await workerService.deleteWorker(req.params.id);

    res.json({
      success: true,
      message: 'Worker deleted successfully.',
      data: worker,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createWorker,
  getAllWorkers,
  getWorkerById,
  updateWorker,
  toggleWorkerStatus,
  deleteWorker,
};
