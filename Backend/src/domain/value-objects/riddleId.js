class RiddleId {
  constructor(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('RiddleId must be a non-empty string');
    }
    this._value = value;
  }

  get value() {
    return this._value;
  }

  equals(other) {
    if (!(other instanceof RiddleId)) {
      return false;
    }
    return this._value === other._value;
  }

  toString() {
    return this._value;
  }

  static generate() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return new RiddleId(`riddle_${timestamp}_${random}`);
  }

  static fromString(value) {
    return new RiddleId(value);
  }
}

module.exports = RiddleId; 