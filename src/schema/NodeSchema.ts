import { PropertyOptions } from "./PropertyOptions";
import { RelationshipSchema } from "./RelationshipSchema";
import { CustomType } from "./types/CustomType";


export class NodeSchema<T> {
  public relationships: Record<string, RelationshipSchema<any>> = {};
  public properties: Record<keyof T, PropertyOptions>;

    constructor(public label: string,
        properties: 
       Record<keyof T, PropertyOptions>) {
        if('id' in properties) {
            throw new Error('id is a reserved property name')
        }
        this.properties = {
          ...properties,
          id: {
            type: 'string',
            required: false
          }
        }
       }

       addRelationshipe<R>(key:string, relationship: RelationshipSchema<R>) {
        this.relationships[key] = relationship;
        return this;
       }

       validateSchema():void{
        for(const key in this.properties){
          const options = this.properties[key];

          if(options.required && options.default === undefined){
            throw new Error(`Property ${String(key)} cannot have both required and default options`)
          }
          if(typeof options.type !== 'string' ){
            const customType = options.type as CustomType;
            if(customType.validate && !customType.validate(options.default)){
              throw new Error(`Default value for property ${String(key)} is invalid`)
            }
          }

        }
       }
  }