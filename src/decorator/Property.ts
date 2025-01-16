import 'reflect-metadata'

 const PROPERTY_METADATA_KEY = 'neo:property'

export function Property(options: { required?: boolean; unique?: boolean } = {}) {
    return (target: any, key: string) => {
      const properties = Reflect.getMetadata(PROPERTY_METADATA_KEY, target) || [];
      properties.push({ key, ...options });
      Reflect.defineMetadata(PROPERTY_METADATA_KEY, properties, target);
    };
  }

