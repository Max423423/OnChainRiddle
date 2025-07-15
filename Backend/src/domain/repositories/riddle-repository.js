class RiddleRepository {
  async save(riddle) {
    throw new Error('save method must be implemented');
  }

  async findById(id) {
    throw new Error('findById method must be implemented');
  }

  async findActive() {
    throw new Error('findActive method must be implemented');
  }

  async findLatest() {
    throw new Error('findLatest method must be implemented');
  }

  async update(riddle) {
    throw new Error('update method must be implemented');
  }

  async delete(id) {
    throw new Error('delete method must be implemented');
  }
}

module.exports = RiddleRepository; 