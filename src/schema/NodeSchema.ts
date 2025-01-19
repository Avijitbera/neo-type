import { RelationshipSchema } from "./RelationshipSchema";


export class NodeSchema<T> {
  public relationships: Record<string, RelationshipSchema<any>> = {};
    constructor(public label: string,
       public properties: 
       Record<keyof T, string>) {
        if('id' in properties) {
            throw new Error('id is a reserved property name')
        }
        this.properties = {
          ...properties,
          id: 'string'
        }
       }

       addRelationshipe<R>(key:string, relationship: RelationshipSchema<R>) {
        this.relationships[key] = relationship;
        return this;
       }
  }