
import { InMemoryDBClient, ProtocolCode } from "@/database";

class Worker {
    private dbClient: InMemoryDBClient;

    constructor(dbClient: InMemoryDBClient){
        this.dbClient = dbClient;
    }

    
    async process(topic: string){
        const response = await this.dbClient.subscribe(topic);
        if(response.code !== ProtocolCode.OK) throw new Error(response.message);

        this.dbClient.listenChannel((ct: string) => {
            
        });
    }
}