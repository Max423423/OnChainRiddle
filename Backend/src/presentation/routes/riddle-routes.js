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
    this._router.get('/health', (req, res) => this._controller.getHealth(req, res));

    this._router.get('/status', (req, res) => this._controller.getStatus(req, res));

    this._router.post('/generate-riddle', (req, res) => this._controller.generateRiddle(req, res));

    this._router.post('/handle-winner', (req, res) => this._controller.handleWinner(req, res));
  }

  getRouter() {
    return this._router;
  }
}

module.exports = RiddleRoutes; 