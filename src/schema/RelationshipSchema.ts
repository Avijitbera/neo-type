
export class RelationshipSchema<R = {}> {
    constructor(
      public type: string, // Relationship type (e.g., "FRIENDS_WITH")
      public direction: 'in' | 'out', // Direction of the relationship
      public properties?: R, // Optional properties for the relationship
    ) {}
  }
