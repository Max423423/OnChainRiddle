import { validateEthereumAddress } from './validation';

describe('Validation Utils', () => {
  describe('validateEthereumAddress', () => {
    test('Given a valid Ethereum address, When validating, Then it should return true', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      ];

      validAddresses.forEach(address => {
        expect(validateEthereumAddress(address)).toBe(true);
      });
    });

    test('Given an invalid Ethereum address, When validating, Then it should return false', () => {
      const invalidAddresses = [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b', // Too short
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b67', // Too long
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8bG', // Invalid character
        '742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Missing 0x prefix
        '0X742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Wrong prefix case
        '', // Empty string
        'not-an-address', // Random string
        '0x', // Just prefix
        '0x123' // Too short with prefix
      ];

      invalidAddresses.forEach(address => {
        expect(validateEthereumAddress(address)).toBe(false);
      });
    });

    test('Given a null or undefined address, When validating, Then it should return false', () => {
      expect(validateEthereumAddress(null as any)).toBe(false);
      expect(validateEthereumAddress(undefined as any)).toBe(false);
    });
  });
}); 