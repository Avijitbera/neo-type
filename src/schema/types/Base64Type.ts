import { CustomType } from "./CustomType";

export const Base64Type: CustomType<string> = {
    type: 'base64',
    serialize: (value) => value, // Store as-is
    deserialize: (value) => value, // Return as-is
    validate: (value) => typeof value === 'string' && /^[A-Za-z0-9+/=]*$/.test(value), // Validate base64
  };
