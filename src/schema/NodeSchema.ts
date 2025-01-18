

export class NodeSchema<T> {
    constructor(public label: string, public properties: { key: string, required?: boolean, unique?: boolean }[] = [], public relationships: { key: string, type: string, direction: 'in' | 'out', properties?: Record<keyof T, any> } ){}
}