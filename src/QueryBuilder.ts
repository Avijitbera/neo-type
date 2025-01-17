

import { NodeEntity } from "./NodeEntity";


export class QueryBuilder<T extends NodeEntity>{
    private label: string;
    private properties: { key:string, required?: boolean, unique?: boolean }[] = [];
    private relationships: { key: string, type: string, direction: 'in' | 'out', properties?: any }[] = [];

    constructor(private entity: new () => T){
        this.label = Reflect.getMetadata("neo:node", this.entity);
        this.properties = Reflect.getMetadata("neo:property", this.entity.prototype) || [];
        this.relationships = Reflect.getMetadata("neo:relationship", this.entity.prototype) || [];
    }

    createQuery(data: Partial<T>):string{
        const properties = this.properties.filter((p) => 
        data[p.key] !== undefined)
        .map((p) => `${p.key}: ${data[p.key]}`)
        .join(', ');
        return `CREATE (${this.label} { ${properties} }) RETURN n`;
    }

    findByIdQuery(id: string, data: Partial<T>):string{
        return `MATCH (n:${this.label}) WHERE id(n) = $id RETURN n`
    }

    updateQuery(id: string, data: Partial<T>):string{
        const properties = this.properties.filter((p) => 
        data[p.key] !== undefined)
        .map((p) => `n.${p.key} = $${data[p.key]}`)
        .join(', ');

        return `MATCH (n:${this.label}) WHERE id(n) = $id SET ${properties} RETURN n`
    }

    deleteQuery(id:string):string{
        return `MATCH (n:${this.label}) WHERE id(n) = $id DELETE n`

    }

    createRelationshipQuery(sourceId:string,
        targetId:string,
        relationshipKey:any,
        properties?:any
    ): string {
        const relationship = this.relationships.find((r) => r.key === relationshipKey);

        if(!relationship){
            throw new Error(`Relationship ${relationshipKey} not found`);
        }
        const {type, direction} = relationship;
        const [sourceNode, targetNode] = direction === 'out' ? ['a', 'b'] : ['b', 'a']

        const relationshipProperties = properties ? Object.entries(properties).map(([key, value]) => `${key}: $${key}`).join(', ') : '';

        return `
        MATCH (a:${this.label}), (b:${this.label})
        WHERE id(a) = $sourceId AND id(b) = $targetId
        CREATE (${sourceNode})-[:${type} {${relationshipProperties}}]->(${targetNode}))
        RETURN a, b
        `

    }

}