import {Connection,
    EdgeClient,  
    NodeEntity
} from '../src'
import {NodeSchema, 
    RelationshipSchema
} from '../src/schema'
import dotenv from 'dotenv'
dotenv.config()

interface User{
    // id?:string;
    name:string;
    age:number;
}

const userSchema = new NodeSchema<User>(
    'User',
    {
        age:'number',
        name:'string',
        // id:'string'
    }
)
const friendsRelationship = new RelationshipSchema('FRIENDS_WITH', 'out', {
    since: 'string',
  });

const main = async() =>{
    const host = process.env.NEO_HOST
    const user = process.env.NEO_USER
    const password = process.env.NEO_PASSWORD

    const connection = new Connection(host!, user!, password!)
    await connection.connect()

    const edgeClient = new EdgeClient(connection, userSchema)


    
   const user1 = await edgeClient.create<User>({
    age: 20,
    name: 'John Doe'
   })
console.log('Created User:', user1);
   const foundUser = await edgeClient.findById(user1.id!);
  console.log('Found User:', foundUser);

   
    await connection.disconnect()

}
main()