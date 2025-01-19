import { CustomType } from "./CustomType";

const isBufferAvailable = typeof Buffer !== 'undefined';

export const BytesType: CustomType<Uint8Array | Buffer> = {
  type: 'bytes',
  serialize: (value:any) => {
    if (value instanceof Uint8Array) {
      return Buffer.from(value).toString('base64'); // Convert Uint8Array to base64
    } else if (isBufferAvailable && value instanceof Buffer) {
      return value.toString('base64'); // Convert Buffer to base64
    }
    throw new Error('Invalid bytes value. Expected Uint8Array or Buffer.');
  },
  deserialize: (value) => {
    return Buffer.from(value, 'base64'); // Convert base64 back to Buffer
  },
  validate: (value:any) => {
    if (value instanceof Uint8Array) {
      return true;
    }
    if (isBufferAvailable && value instanceof Buffer) {
      return true;
    }
    return false;
  },
};