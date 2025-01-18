import { RelationshipSchema } from "./RelationshipSchema";


export class NodeSchema<T> {
  public relationships: Record<string, RelationshipSchema> = {};
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

       addRelationshipe(key:string, relationship: RelationshipSchema) {
        this.relationships[key] = relationship;
        return this;
       }
  }