import { CustomType } from "./types/CustomType";


export interface PropertyOptions {
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'timestamp' | 'bytes' | 'base64' | CustomType;
    required?:boolean;
    unique?:boolean;
    index?:boolean;
    default?:any;
    validate?: (value: any) => boolean
}
