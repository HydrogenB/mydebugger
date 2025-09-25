declare module "clarinet" {
  // Minimal types to satisfy TS; actual runtime is provided by the clarinet package
  export interface ClarinetStream {
    onopenarray: () => void;
    onclosearray: () => void;
    onopenobject: (key?: string) => void;
    oncloseobject: () => void;
    onkey: (key: string) => void;
    onvalue: (value: any) => void;
    onerror: (err: any) => void;
    write: (chunk: string) => void;
    close: () => void;
    _parser: { error: any; resume: () => void };
  }

  export function createStream(mode?: string, opts?: Record<string, any>): ClarinetStream;
}
