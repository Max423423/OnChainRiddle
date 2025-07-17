export {};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }

  interface ImportMetaEnv {
    readonly VITE_CONTRACT_ADDRESS: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
} 