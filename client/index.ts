import {Connection,
    EdgeClient,  
    NodeEntity
} from '../src'
import {Node} from '../src/decorator/Node'
import { Property } from '../src/decorator/Property';
import { Relationship } from '../src/decorator/Relationship';

@Node('User')
class User extends NodeEntity {
    @Property('name')
    name:string;

    @Property('age')
    age: number;

    @Relationship('FRIEND_WITH', 'out', { properties: { since: 'string' } })
    friends: User[];

}

const main = async() =>{
    const host = process.env.HOST
    const user = process.env.USER
    const password = process.env.PASSWORD

    const connection = new Connection(host!, user!, password!)
    await connection.connect()

    const edgeClient = new EdgeClient(connection)

    const user1 = await edgeClient.create(
        User,
        {
            age: 20,
            name: 'John'
        }
    )
    const user2 = await edgeClient.create(
        User,
        {
            age: 23,
            name: 'Jane'
        }
    )

    await edgeClient.createRelationship(
        User,
        user1.id!,
        user2.id!,
        'FRIEND_WITH',
        {
            since: '2023-01-01'
        }
    )
    await connection.disconnect()

}
main()