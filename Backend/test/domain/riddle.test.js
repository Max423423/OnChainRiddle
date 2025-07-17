const Riddle = require('../../src/domain/entities/riddle');
const RiddleId = require('../../src/domain/value-objects/riddleId');

describe('Riddle Entity', () => {
  let riddle;

  beforeEach(() => {
    riddle = Riddle.create('What has keys but no locks?', 'keyboard');
  });

  describe('Given a new riddle is created', () => {
    it('When creating with valid data Then it should have correct properties', () => {
      expect(riddle.question).toBe('What has keys but no locks?');
      expect(riddle.answer).toBe('keyboard');
      expect(riddle.isActive).toBe(false);
      expect(riddle.winner).toBe(null);
      expect(riddle.isSolved()).toBe(false);
    });

    it('When creating with empty question Then it should throw error', () => {
      expect(() => Riddle.create('', 'answer')).toThrow('Riddle question cannot be empty');
      expect(() => Riddle.create(null, 'answer')).toThrow('Riddle question cannot be empty');
    });

    it('When creating with empty answer Then it should throw error', () => {
      expect(() => Riddle.create('question', '')).toThrow('Riddle answer cannot be empty');
      expect(() => Riddle.create('question', null)).toThrow('Riddle answer cannot be empty');
    });
  });

  describe('Given an inactive riddle', () => {
    it('When activating Then it should become active', () => {
      riddle.activate();
      expect(riddle.isActive).toBe(true);
      expect(riddle.winner).toBe(null);
    });

    it('When setting winner Then it should become solved and inactive', () => {
      riddle.activate();
      riddle.setWinner('0x123456789');
      
      expect(riddle.isActive).toBe(false);
      expect(riddle.winner).toBe('0x123456789');
      expect(riddle.isSolved()).toBe(true);
    });
  });

  describe('Given an active riddle', () => {
    beforeEach(() => {
      riddle.activate();
    });

    it('When setting winner Then it should become solved', () => {
      riddle.setWinner('0x123456789');
      expect(riddle.isSolved()).toBe(true);
    });

    it('When deactivating Then it should become inactive', () => {
      riddle.deactivate();
      expect(riddle.isActive).toBe(false);
    });
  });

  describe('Given an inactive riddle', () => {
    it('When setting winner Then it should throw error', () => {
      expect(() => riddle.setWinner('0x123456789')).toThrow('Cannot set winner for inactive riddle');
    });
  });

  describe('Given a riddle with answer validation', () => {
    beforeEach(() => {
      riddle = Riddle.create('What has keys but no locks?', 'keyboard');
    });

    it('When validating correct answer Then it should return true', () => {
      expect(riddle.validateAnswer('keyboard')).toBe(true);
      expect(riddle.validateAnswer('KEYBOARD')).toBe(true);
      expect(riddle.validateAnswer('Keyboard')).toBe(true);
    });

    it('When validating incorrect answer Then it should return false', () => {
      expect(riddle.validateAnswer('mouse')).toBe(false);
      expect(riddle.validateAnswer('')).toBe(false);
    });
  });

  describe('Given a riddle DTO conversion', () => {
    beforeEach(() => {
      riddle = Riddle.create('What has keys but no locks?', 'keyboard');
      riddle.activate();
    });

    it('When converting to DTO Then it should have correct structure', () => {
      const dto = riddle.toDTO();
      
      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('question', 'What has keys but no locks?');
      expect(dto).toHaveProperty('isActive', true);
      expect(dto).toHaveProperty('winner', null);
      expect(dto).toHaveProperty('createdAt');
      expect(dto).toHaveProperty('isSolved', false);
    });

    it('When riddle is solved Then DTO should reflect solved state', () => {
      riddle.setWinner('0x123456789');
      const dto = riddle.toDTO();
      
      expect(dto.isActive).toBe(false);
      expect(dto.winner).toBe('0x123456789');
      expect(dto.isSolved).toBe(true);
    });
  });
});

describe('RiddleId Value Object', () => {
  describe('Given a RiddleId is created', () => {
    it('When creating with valid string Then it should have correct value', () => {
      const id = new RiddleId('riddle_123');
      expect(id.value).toBe('riddle_123');
    });

    it('When creating with empty string Then it should throw error', () => {
      expect(() => new RiddleId('')).toThrow('RiddleId must be a non-empty string');
    });

    it('When creating with null Then it should throw error', () => {
      expect(() => new RiddleId(null)).toThrow('RiddleId must be a non-empty string');
    });
  });

  describe('Given two RiddleIds', () => {
    it('When they have same value Then equals should return true', () => {
      const id1 = new RiddleId('riddle_123');
      const id2 = new RiddleId('riddle_123');
      expect(id1.equals(id2)).toBe(true);
    });

    it('When they have different values Then equals should return false', () => {
      const id1 = new RiddleId('riddle_123');
      const id2 = new RiddleId('riddle_456');
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('Given RiddleId generation', () => {
    it('When generating Then it should create unique IDs', () => {
      const id1 = RiddleId.generate();
      const id2 = RiddleId.generate();
      
      expect(id1).toBeInstanceOf(RiddleId);
      expect(id2).toBeInstanceOf(RiddleId);
      expect(id1.equals(id2)).toBe(false);
    });

    it('When generating Then it should have correct format', () => {
      const id = RiddleId.generate();
      expect(id.value).toMatch(/^riddle_\d+_[a-z0-9]+$/);
    });
  });
}); 