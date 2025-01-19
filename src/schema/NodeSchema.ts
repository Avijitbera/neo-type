import { NodeEntity } from "../NodeEntity";
import { PropertyOptions } from "./PropertyOptions";
import { RelationshipSchema } from "./RelationshipSchema";
import { CustomType } from "./types/CustomType";


export class NodeSchema<T extends NodeEntity> {
  public properties: Map<keyof T, PropertyOptions>;
  public relationships: Map<string, RelationshipSchema<any>> = new Map();

  constructor(public label: string, properties: Record<keyof T, PropertyOptions>) {
    this.properties = new Map(Object.entries(properties) as [keyof T, PropertyOptions][]);

    // Ensure the `id` field is not overridden by user-defined properties
    if (this.properties.has('id' as keyof T)) {
      throw new Error('The "id" field is reserved and cannot be defined in the schema.');
    }

    // Add the `id` field as a default field
    this.properties.set('id' as keyof T, { type: 'string', required: false });
  }

       addRelationship<R>(key: string, relationship: RelationshipSchema<R>): this {
        this.relationships.set(key, relationship);
        return this;
      }

       validateSchema(): void {
        // Iterate over the properties Map
        for (const [key, options] of this.properties) {
          // Check if the property is required and has no default value
          if (options.required && options.default === undefined) {
            throw new Error(`Property ${String(key)} cannot have both required and default options.`);
          }
    
          // Validate custom types
          if (typeof options.type !== 'string') {
            const customType = options.type as CustomType;
            if (customType.validate && !customType.validate(options.default)) {
              throw new Error(`Default value for property ${String(key)} is invalid.`);
            }
          }
        }
      }
  }