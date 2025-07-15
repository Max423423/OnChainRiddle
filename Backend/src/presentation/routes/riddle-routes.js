const express = require('express');
const RiddleController = require('../controllers/riddle-controller');

class RiddleRoutes {
  constructor(generateRiddleUseCase, handleWinnerUseCase, riddleRepository) {
    this._router = express.Router();
    this._controller = new RiddleController(
      generateRiddleUseCase,
      handleWinnerUseCase,
      riddleRepository
    );
    this._setupRoutes();
  }

  _setupRoutes() {
    // Health check
    this._router.get('/health', (req, res) => this._controller.getHealth(req, res));

    // Status endpoint
    this._router.get('/status', (req, res) => this._controller.getStatus(req, res));

    // Generate riddle
    this._router.post('/generate-riddle', (req, res) => this._controller.generateRiddle(req, res));

    // Handle winner manually
    this._router.post('/handle-winner', (req, res) => this._controller.handleWinner(req, res));

    // Get riddle history
    this._router.get('/riddle-history', (req, res) => this._controller.getRiddleHistory(req, res));
  }

  getRouter() {
    return this._router;
  }
}

module.exports = RiddleRoutes; 