/**
 * Utilitaires de validation pour l'application OnchainRiddle
 */

/**
 * Valide une adresse Ethereum
 * @param address - L'adresse à valider
 * @returns true si l'adresse est valide, false sinon
 */
export function validateEthereumAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Format basique d'une adresse Ethereum
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  
  return ethereumAddressRegex.test(address);
}

/**
 * Valide un nom de joueur
 * @param name - Le nom à valider
 * @returns true si le nom est valide, false sinon
 */
export function validatePlayerName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmedName = name.trim();
  
  // Le nom doit avoir entre 2 et 50 caractères
  if (trimmedName.length < 2 || trimmedName.length > 50) {
    return false;
  }

  // Le nom ne doit pas contenir que des chiffres ou des caractères spéciaux
  const hasValidCharacters = /[a-zA-ZÀ-ÿ\u4e00-\u9fff\u0600-\u06ff]/.test(trimmedName);
  if (!hasValidCharacters) {
    return false;
  }

  return true;
}

/**
 * Valide une réponse d'énigme
 * @param answer - La réponse à valider
 * @returns true si la réponse est valide, false sinon
 */
export function validateAnswer(answer: string): boolean {
  if (!answer || typeof answer !== 'string') {
    return false;
  }

  const trimmedAnswer = answer.trim();
  
  // La réponse ne doit pas être vide
  if (trimmedAnswer.length === 0) {
    return false;
  }

  // La réponse ne doit pas dépasser 50 caractères
  if (trimmedAnswer.length > 50) {
    return false;
  }

  return true;
}

/**
 * Valide un chainId Ethereum
 * @param chainId - Le chainId à valider
 * @returns true si le chainId est valide, false sinon
 */
export function validateChainId(chainId: number): boolean {
  if (typeof chainId !== 'number' || chainId <= 0) {
    return false;
  }

  // ChainIds connus (peut être étendu)
  const knownChainIds = [
    1,    // Ethereum Mainnet
    3,    // Ropsten (déprécié)
    4,    // Rinkeby (déprécié)
    5,    // Goerli
    10,   // Optimism
    42,   // Kovan (déprécié)
    56,   // BSC
    137,  // Polygon
    42161, // Arbitrum One
    11155111, // Sepolia
    31337 // Hardhat local
  ];

  return knownChainIds.includes(chainId);
}

/**
 * Formate une adresse Ethereum pour l'affichage
 * @param address - L'adresse à formater
 * @returns L'adresse formatée (ex: 0x1234...5678)
 */
export function formatEthereumAddress(address: string): string {
  if (!validateEthereumAddress(address)) {
    return 'Invalid Address';
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Valide un formulaire de soumission d'énigme
 * @param data - Les données du formulaire
 * @returns Un objet avec les erreurs de validation
 */
export function validateSubmissionForm(data: {
  playerName: string;
  answer: string;
  walletAddress?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validatePlayerName(data.playerName)) {
    errors.push('Le nom du joueur doit contenir entre 2 et 50 caractères et inclure des lettres');
  }

  if (!validateAnswer(data.answer)) {
    errors.push('La réponse ne doit pas être vide et ne pas dépasser 50 caractères');
  }

  if (data.walletAddress && !validateEthereumAddress(data.walletAddress)) {
    errors.push('L\'adresse du wallet n\'est pas valide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 