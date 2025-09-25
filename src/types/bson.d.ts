declare module "bson" {
  // Minimal ambient types for browser usage in this project
  export class ObjectId {
    constructor(id?: string | number | Uint8Array);
    toHexString(): string;
  }
  export class Decimal128 { toString(): string; }
  export class Long { toString(): string; toNumber(): number; }
  export class Binary { buffer: Uint8Array; constructor(buffer: Uint8Array); }
  export class BSONRegExp { pattern: string; options: string; }
  export class Timestamp { getHighBits(): number; }

  export function deserialize(bytes: Uint8Array): unknown;
}
