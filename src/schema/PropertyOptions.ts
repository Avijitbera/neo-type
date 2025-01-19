

export interface PropertyOptions {
    type: 'string' | 'number' | 'boolean' | 'date';
    required?:boolean;
    unique?:boolean;
    index?:boolean;
    default?:any;
    validate?: (value: any) => boolean
}
