import {Driver, driver as createDriver, auth} from 'neo4j-driver'

export class Connection {
    private driver: Driver | null = null;

    constructor(private uri:string, private user:string, private password:string){
        
    }

    async connect():Promise<void>{
        if(!this.driver){
            throw new Error('Already connected')
        }

        this.driver = createDriver(this.uri, auth.basic(this.user, this.password))
        await this.driver.verifyAuthentication();
        console.log('Connected to Neo4j')
    }

    async disconnect():Promise<void>{
        if(this.driver){
            await this.driver.close()
            this.driver = null
            console.log('Disconnected from Neo4j')
        }
    }

    getDriver():Driver {
        if(!this.driver){
            throw new Error('Not connected')
        }
        return this.driver
    }
}
