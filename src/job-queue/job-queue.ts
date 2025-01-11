import { v4 as uuidv4 } from 'uuid';
import database from '@/database';
import { InMemoryDBClient, ProtocolCode } from "@/database";

export type Job<T> = {
    id: string;
    payload: T;
};

class JobQueue {
    private dbClient: InMemoryDBClient;

    constructor(dbClient: InMemoryDBClient){
        this.dbClient = dbClient;
    }

    /**
     * queue FIFO, push back, pop front 
     * @param queueKey use this key to store a list
     * @param payload value that you want worker to get, define T for payload
     * @returns job
     */
    async add<T>(queueKey: string, payload: T): Promise<Job<T>> {
        const id = uuidv4();
        const data = { id, payload };
        const response = await this.dbClient.lPushBack(queueKey, [JSON.stringify(data)]);
        if(response.code !== ProtocolCode.OK) throw new Error(response.message);

        const pubResponse = await this.dbClient.publish(queueKey);
        if(pubResponse.code !== ProtocolCode.OK)  throw new Error(response.message);

        return data;
    }
}

export async function createJobQueue(dbUrl: string){
    const client = database.createClient();
    await client.connect(dbUrl);
    return new JobQueue(client);
}