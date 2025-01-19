import { Driver, Record } from "neo4j-driver";
import { Connection } from "./Connection";
import { NodeEntity } from "./NodeEntity";
import { QueryBuilder } from "./QueryBuilder";
import { NodeSchema } from "./schema";
import { PropertyOptions } from "./schema/PropertyOptions";


export class EdgeClient<T extends NodeEntity> {
    constructor(private connection: Connection, private schema: NodeSchema<T>) {}

    private getDriver(): Driver {
        return this.connection.getDriver();
    }

    async create(data: Partial<T>): Promise<T & { id: string }> {
        const session = this.getDriver().session();
        const queryBuilder = new QueryBuilder(this.schema);
        const query = queryBuilder.createQuery(data);
    
        try {
          const result = await session.run(query, data);
          return this.mapRecordToEntity(result.records[0]);
        } finally {
          await session.close();
        }
      }

      async findById(id: string): Promise<(T & { id: string }) | null> {
        const session = this.getDriver().session();
        const queryBuilder = new QueryBuilder(this.schema);
        const query = queryBuilder.findByIdQuery(id);
    
        try {
          const result = await session.run(query, { id: parseInt(id, 10) });
          if (result.records.length === 0) return null;
          return this.mapRecordToEntity(result.records[0]);
        } finally {
          await session.close();
        }
      }

      async update(id: string, data: Partial<T>): Promise<(T & { id: string }) | null> {
        const session = this.getDriver().session();
        const queryBuilder = new QueryBuilder(this.schema);
        const query = queryBuilder.updateQuery(id, data);
    
        try {
          const result = await session.run(query, { id: parseInt(id, 10), ...data });
          if (result.records.length === 0) return null;
          return this.mapRecordToEntity(result.records[0]);
        } finally {
          await session.close();
        }
      }

      async delete(id: string): Promise<void> {
        const session = this.getDriver().session();
        const queryBuilder = new QueryBuilder(this.schema);
        const query = queryBuilder.deleteQuery(id);
    
        try {
          await session.run(query, { id: parseInt(id, 10) });
        } finally {
          await session.close();
        }
      }

      private serializeData(data: Partial<T>): Map<string, any> {
        const serialized = new Map<string, any>(); // Use Map instead of Record
    
        // Iterate over the schema properties
        for (const [key, options] of this.schema.properties) {
          const value = data[key]; // Access the value from the data object
    
          // Check if the property is required
          if (options.required && value === undefined) {
            throw new Error(`Property ${String(key)} is required.`);
          }
    
          // Apply default value if not provided
          if (value === undefined && options.default !== undefined) {
            serialized.set(key as string, options.default);
          } else {
            // Serialize the value based on its type
            serialized.set(key as string, this.serializeValue(value, options.type));
          }
    
          // Validate the property value
          if (options.validate && !options.validate(value)) {
            throw new Error(`Validation failed for property ${String(key)}.`);
          }
        }
    
        return serialized;
      }

      private serializeValue(value: any, type: PropertyOptions['type']): any {
        if (typeof type === 'string') {
          // Built-in types
          switch (type) {
            case 'string':
              return value;
            case 'number':
              return value;
            case 'boolean':
              return value;
            case 'date':
              return value instanceof Date ? value.toISOString() : value;
            case 'timestamp':
              return value instanceof Date ? value.toISOString() : value;
            case 'array':
            case 'object':
              return JSON.stringify(value);
            case 'bytes':
              return Buffer.from(value).toString('base64'); // Convert bytes to base64
            case 'base64':
              return value; // Store base64 as-is
            default:
              throw new Error(`Unsupported type: ${type}`);
          }
        } else {
          // Custom types
          return type.serialize(value);
        }
      }

      private deserializeValue(value: any, type: PropertyOptions['type']): any {
        if (typeof type === 'string') {
          // Built-in types
          switch (type) {
            case 'string':
              return value;
            case 'number':
              return value;
            case 'boolean':
              return value;
            case 'date':
            case 'timestamp':
              return new Date(value);
            case 'array':
            case 'object':
              return JSON.parse(value);
            case 'bytes':
              return Buffer.from(value, 'base64'); // Convert base64 back to bytes
            case 'base64':
              return value; // Return base64 as-is
            default:
              throw new Error(`Unsupported type: ${type}`);
          }
        } else {
          // Custom types
          return type.deserialize(value);
        }
      }

      async createRelationship<R>(
        sourceId: string,
        targetId: string,
        relationshipKey: string,
        properties?: R,
      ): Promise<void> {
        const session = this.getDriver().session();
        const relationship = this.schema.relationships.get(relationshipKey);
        if (!relationship) {
          throw new Error(`Relationship ${relationshipKey} not found.`);
        }
    
        const queryBuilder = new QueryBuilder(this.schema);
        const query = queryBuilder.createRelationshipQuery(sourceId, targetId, relationship, properties);
    
        try {
          await session.run(query, { sourceId: parseInt(sourceId, 10), targetId: parseInt(targetId, 10), ...properties });
        } finally {
          await session.close();
        }
      }

    //   async createRelationship(
    //     sourceId: string,
    //     targetId: string,
    //     relationship: RelationshipSchema,
    //   ): Promise<void> {
    //     const session = this.getDriver().session();
    //     const queryBuilder = new QueryBuilder(this.schema);
    //     const query = queryBuilder.createRelationshipQuery(sourceId, targetId, relationship);
    
    //     try {
    //       await session.run(query, { sourceId: parseInt(sourceId, 10), targetId: parseInt(targetId, 10), ...relationship.properties });
    //     } finally {
    //       await session.close();
    //     }
    //   }
    


      private mapRecordToEntity<T>(record: Record): T & { id: string } {
        const node = record.get('n');
        const entity: any = {};
    
        Object.keys(node.properties).forEach((key) => {
          entity[key] = node.properties[key];
        });
    
        entity.id = node.identity.toString();
        return entity;
      }
}