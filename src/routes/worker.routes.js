const express = require('express');
console.log('WORKER ROUTES LOADED');

const router = express.Router();

const workerController = require('../controllers/worker.controller');

router.post('/', workerController.createWorker);

router.get('/', workerController.getAllWorkers);

router.get('/:id', workerController.getWorkerById);

router.put('/:id', workerController.updateWorker);

router.patch('/:id/status', workerController.toggleWorkerStatus);

router.delete('/:id', workerController.deleteWorker);

module.exports = router;
