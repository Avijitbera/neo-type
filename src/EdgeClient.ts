import { Driver, Record } from "neo4j-driver";
import { Connection } from "./Connection";
import { NodeEntity } from "./NodeEntity";
import { QueryBuilder } from "./QueryBuilder";


export class EdgeClient {
    constructor(private connection: Connection) {
        
    }

    private getDriver(): Driver {
        return this.connection.getDriver();
    }

    async create<T extends NodeEntity>(entity:new() => T, data:Partial<T>):Promise<T>{
        const session = this.getDriver().session();
        const queryBuilder = new QueryBuilder(entity);
        const query = queryBuilder.createQuery(data);
        try {
            const result = await session.run(query, data);
            return this.mapRecordToEntity(entity, result.records[0]);

        } finally {
            await session.close();
        }

    }

    async findById<T extends NodeEntity>(
        entity:new () => T, 
        id: string,
    ): Promise<T | null>{
        const session = this.getDriver().session();
        const queryBuilder = new QueryBuilder(entity);
        const query = queryBuilder.findByIdQuery(id, {});
        try {
            const result = await session.run(query, { id });
            if(result.records.length === 0){
                return null;
            }
            return this.mapRecordToEntity(entity, result.records[0]);
        } finally {
            await session.close();
        }
    }

    async update<T extends NodeEntity>(
        entity:new () => T,
        id: string,
        data:Partial<T>,
    ): Promise<T | null>{
        const session = this.getDriver().session();
        const queryBuilder = new QueryBuilder(entity);
        const query = queryBuilder.updateQuery(id, data);
        try {
            const result = await session.run(query, { id: parseInt(id, 10), ...data });
            if(result.records.length === 0){
                return null;
            }
            return this.mapRecordToEntity(entity, result.records[0]);
        } finally {
            await session.close();
        }
    }

    async delete<T extends NodeEntity>(entity:new () => T, id: string):Promise<void>{
        const session = this.getDriver().session();
        const queryBuilder = new QueryBuilder(entity);
        const query = queryBuilder.deleteQuery(id);
        try {
            await session.run(query, { id: parseInt(id, 10) });
        } finally {
            await session.close();
        }
    }

    async createRelationship<T extends NodeEntity>(
        entity: new () => T,
        sourceId: string,
        targetId: string,
        relationshipKey: any,
        properties?: any,
      ): Promise<void> {
          const session = this.getDriver().session();
          const queryBuilder = new QueryBuilder(entity);
          const query = queryBuilder.createRelationshipQuery(sourceId, targetId, relationshipKey, properties);
          try {
            await session.run(query, { sourceId: parseInt(sourceId, 10), targetId: parseInt(targetId, 10), ...properties });
          } finally {
            await session.close();
          }
      }
    


    private mapRecordToEntity<T extends NodeEntity>(entity: new () => T, record: Record): T {
        const node = record.get('n');
        const instance = new entity();
      
        Object.keys(node.properties).forEach((key) => {
          // Use type assertion to allow dynamic property assignment
          (instance as any)[key] = node.properties[key];
        });
      
        instance.id = node.identity.toString();
        return instance;
      }
}