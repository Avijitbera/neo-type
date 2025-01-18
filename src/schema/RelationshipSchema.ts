
export class RelationshipSchema {
    constructor(
        public type: string,
        public direction: 'in' | 'out',
        public properties?: Record<string, any>
    ){}
}
