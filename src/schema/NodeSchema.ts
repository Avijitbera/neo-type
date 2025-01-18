

export class NodeSchema<T> {
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
  }