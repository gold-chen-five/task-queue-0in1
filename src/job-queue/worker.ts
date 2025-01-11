
import { InMemoryDBClient, ProtocolCode } from "@/database";
import { Job } from "./job-queue";

class Worker {
    private dbClient: InMemoryDBClient;
    private processes: Record<string, (job: any) => Promise<void>> = {};

    constructor(dbClient: InMemoryDBClient){
        this.dbClient = dbClient;
        this.dbClient.listenChannel(async (topic: string) => {
            if(!this.processes[topic]) throw new Error("no process");
            this.work(topic);
        });
    }
    
    private async work(topic: string){
        const response = await this.dbClient.lPopFront(topic);
        if(response.code === ProtocolCode.List_IS_EMPTY)  return;

        const res = this.dbClient.parseResponseString(response);
        const job = JSON.parse(res.data);
        await this.processes[topic](job);

        this.work(topic);
    }

    async process<T>(topic: string, callback: (job: Job<T>) => Promise<void>){
        const response = await this.dbClient.subscribe(topic);
        if(response.code !== ProtocolCode.OK) throw new Error(response.message);
        this.processes[topic] = callback;
    }
}

export default Worker;
