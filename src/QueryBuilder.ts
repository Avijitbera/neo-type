

import { NodeEntity } from "./NodeEntity";
import { NodeSchema, RelationshipSchema } from "./schema";


export class QueryBuilder<T extends NodeEntity>{
   
    constructor(private schema: NodeSchema<T>) {}

    createQuery(data: Partial<T>): string {
        const properties = Object.keys(data)
          .map((key) => `${key}: $${key}`)
          .join(', ');
    
        return `CREATE (n:${this.schema.label} {${properties}}) RETURN n`;
      }

      findByIdQuery(id: string): string {
        return `MATCH (n:${this.schema.label}) WHERE id(n) = $id RETURN n`;
      }

      updateQuery(id: string, data: Partial<T>): string {
        const properties = Object.keys(data)
          .map((key) => `n.${key} = $${key}`)
          .join(', ');
    
        return `MATCH (n:${this.schema.label}) WHERE id(n) = $id SET ${properties} RETURN n`;
      }
    
      deleteQuery(id: string): string {
        return `MATCH (n:${this.schema.label}) WHERE id(n) = $id DELETE n`;
      }

      createRelationshipQuery(
        sourceId: string,
        targetId: string,
        relationship: RelationshipSchema,
      ): string {
        const [sourceNode, targetNode] =
          relationship.direction === 'out' ? ['a', 'b'] : ['b', 'a'];
    
        const relationshipProperties = relationship.properties
          ? Object.keys(relationship.properties)
              .map((key) => `${key}: $${key}`)
              .join(', ')
          : '';
    
        return `
          MATCH (a:${this.schema.label}), (b:${this.schema.label})
          WHERE id(a) = $sourceId AND id(b) = $targetId
          CREATE (${sourceNode})-[:${relationship.type} {${relationshipProperties}}]->(${targetNode})
          RETURN a, b
        `;
      }

   

}