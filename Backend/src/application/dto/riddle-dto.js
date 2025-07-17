class RiddleDTO {
  constructor(data) {
    this.id = data.id;
    this.question = data.question;
    this.isActive = data.isActive;
    this.winner = data.winner;
    this.createdAt = data.createdAt;
    this.isSolved = data.isSolved;
  }

  static fromEntity(riddle) {
    return new RiddleDTO({
      id: riddle.id,
      question: riddle.question,
      isActive: riddle.isActive,
      winner: riddle.winner,
      createdAt: riddle.createdAt,
      isSolved: riddle.isSolved()
    });
  }
}

class GenerateRiddleRequestDTO {
  constructor(data = {}) {
    this.language = data.language || 'english';
    this.difficulty = data.difficulty || 'medium';
  }

  static fromRequest(request) {
    return new GenerateRiddleRequestDTO({
      language: request.body?.language,
      difficulty: request.body?.difficulty
    });
  }
}

class GenerateRiddleResponseDTO {
  constructor(success, data, message) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Operation completed successfully') {
    return new GenerateRiddleResponseDTO(true, data, message);
  }

  static error(message, data = null) {
    return new GenerateRiddleResponseDTO(false, data, message);
  }
}

module.exports = {
  RiddleDTO,
  GenerateRiddleRequestDTO,
  GenerateRiddleResponseDTO
}; 