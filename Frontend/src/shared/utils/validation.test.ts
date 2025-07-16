import { describe, test, expect } from 'vitest';
import { validateEthereumAddress } from './validation';

describe('Validation Utils', () => {
  test('should validate correct Ethereum addresses', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
    expect(validateEthereumAddress(validAddress)).toBe(true);
  });

  test('should reject invalid Ethereum addresses', () => {
    const invalidAddresses = [
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b', // Too short
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8bG', // Invalid character
      '742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Missing 0x prefix
      '', // Empty string
    ];

    invalidAddresses.forEach(address => {
      expect(validateEthereumAddress(address)).toBe(false);
    });
  });
}); 