import 'reflect-metadata';
 const RELATIONSHIP_METADATA_KEY = 'neo-type:relationship';

export function Relationship(type: string,
     direction: 'in' | 'out' = 'out',
    options: {properties?: any}
    ) {
  return (target: any, key: string) => {
    const relationships = Reflect.getMetadata(RELATIONSHIP_METADATA_KEY, target) || [];
    relationships.push({ key, type, direction, properties:options.properties });
    Reflect.defineMetadata(RELATIONSHIP_METADATA_KEY, relationships, target);
  };
}
