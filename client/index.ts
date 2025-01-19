import {Connection,
    EdgeClient,  
    NodeEntity
} from '../src'
import {NodeSchema, 
    RelationshipSchema
} from '../src/schema'
import dotenv from 'dotenv'
dotenv.config()

interface User extends NodeEntity {
    name: string;
    age: number;
    image: Uint8Array;
  }

interface FriendsWithProperties {
    since: string;
}

const userSchema = new NodeSchema<User>(
    'User',
    {
        age:{type:'number',},
        
        
        
        // id:'string'
    }
).addRelationship('friends', new RelationshipSchema<FriendsWithProperties>('friends', 'out', {since:'string'}))

const main = async() =>{
    const host = process.env.NEO_HOST
    const user = process.env.NEO_USER
    const password = process.env.NEO_PASSWORD
    

    const connection = new Connection(host!, user!, password!)
    await connection.connect()

    const edgeClient = new EdgeClient(connection, userSchema)


    
    const user1 = await edgeClient.create({ name: 'Alice', age: 25 });
    const user2 = await edgeClient.create({ name: 'Bob', age: 30 });
  
    // Create a relationship with properties
    await edgeClient.createRelationship<FriendsWithProperties>(user1.id!, user2.id!, 'friends', {since:"2022-01-01"});
  
    await connection.disconnect()

}
main()