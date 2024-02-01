declare module 'node-readability' {
    export function readability(url: string, callback: (error: any, article: any) => void): void;
  }