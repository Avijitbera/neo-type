import 'reflect-metadata';
export const RELATIONSHIP_METADATA_KEY = 'neo-type:relationship';

export function Relationship(type: string, direction: 'in' | 'out' = 'out') {
  return (target: any, key: string) => {
    const relationships = Reflect.getMetadata(RELATIONSHIP_METADATA_KEY, target) || [];
    relationships.push({ key, type, direction });
    Reflect.defineMetadata(RELATIONSHIP_METADATA_KEY, relationships, target);
  };
}
