class Riddle {
  constructor(id, question, answer, isActive = false, winner = null, createdAt = new Date()) {
    this._id = id;
    this._question = question;
    this._answer = answer;
    this._isActive = isActive;
    this._winner = winner;
    this._createdAt = createdAt;
  }

  get id() {
    return this._id;
  }

  get question() {
    return this._question;
  }

  get answer() {
    return this._answer;
  }

  get isActive() {
    return this._isActive;
  }

  get winner() {
    return this._winner;
  }

  get createdAt() {
    return this._createdAt;
  }

  activate() {
    this._isActive = true;
    this._winner = null;
  }

  deactivate() {
    this._isActive = false;
  }

  setWinner(winnerAddress) {
    if (!this._isActive) {
      throw new Error('Cannot set winner for inactive riddle');
    }
    this._winner = winnerAddress;
    this._isActive = false;
  }

  isSolved() {
    return this._winner !== null;
  }

  validateAnswer(attemptedAnswer) {
    return this._answer.toLowerCase() === attemptedAnswer.toLowerCase();
  }

  toDTO() {
    return {
      id: this._id,
      question: this._question,
      isActive: this._isActive,
      winner: this._winner,
      createdAt: this._createdAt,
      isSolved: this.isSolved()
    };
  }

  static create(question, answer) {
    if (!question || !question.trim()) {
      throw new Error('Riddle question cannot be empty');
    }
    if (!answer || !answer.trim()) {
      throw new Error('Riddle answer cannot be empty');
    }

    const id = `riddle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Riddle(id, question.trim(), answer.trim().toLowerCase());
  }
}

module.exports = Riddle; 