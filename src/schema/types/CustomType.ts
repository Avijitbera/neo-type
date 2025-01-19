export interface CustomType<T = any> {
    type:string;
    serialize:(value:T) => any;
    deserialize:(value:any) => T;
    validate:(value: T) => boolean;
}