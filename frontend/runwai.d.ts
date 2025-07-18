export {};

declare global {
  interface Window {
    RunwAI?: {
      open: () => void;
      close: () => void;
    };
  }
}
