
import { InMemoryDBClient, ProtocolCode } from "@/database";

class Worker {
    private dbClient: InMemoryDBClient;

    constructor(dbClient: InMemoryDBClient){
        this.dbClient = dbClient;
    }

    process(){
        this.dbClient.subscribe();
    }
}