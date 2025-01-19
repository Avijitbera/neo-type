import { Driver, Record } from "neo4j-driver";
import { Connection } from "./Connection";
import { NodeEntity } from "./NodeEntity";
import { QueryBuilder } from "./QueryBuilder";
import { NodeSchema } from "./schema";


export class EdgeClient<T> {
    constructor(private connection: Connection, private schema: NodeSchema<T>) {}

    private getDriver(): Driver {
        return this.connection.getDriver();
    }

    async create<T>(data: Partial<T>): Promise<T & { id: string }> {
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

      async createRelationship<R>(
        sourceId: string,
        targetId: string,
        relationshipKey: string,
        properties?: R,
      ): Promise<void> {
        const session = this.getDriver().session();
        const relationship = this.schema.relationships[relationshipKey];
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