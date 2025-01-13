
import { InMemoryDBClient, ProtocolCode } from "@/database";
import { Job } from "./job-queue";

type JobProcessor<T> = (job: Job<T>) => Promise<void>;

class Worker {
    private dbClient: InMemoryDBClient;
    private processes: Map<string, JobProcessor<any>> = new Map();

    constructor(dbClient: InMemoryDBClient){
        this.dbClient = dbClient;
        this.setupChanelListener();
    }

    private setupChanelListener(){
        this.dbClient.listenChannel(async (topic: string) => {
            try{
                if(!this.processes.has(topic)) throw new Error(`No processor registered for topic: ${topic}`);
                this.process(topic);
            } catch(err: any) {
                console.error(err.message);
            }
        });
    }

    private async process(topic: string){
        const response = await this.dbClient.lPopFront(topic);
        if(response.code === ProtocolCode.LIST_IS_EMPTY)  return;
        if(response.code !== ProtocolCode.OK) throw new Error(`Fail to pop job: ${response.message}`);

        const res = response.toString();
        const job = JSON.parse(res.data);
        const processor = this.processes.get(topic)!;
        await processor(job);

        this.process(topic);
    }

    public async register<T>(topic: string, processor: JobProcessor<T>){
        const response = await this.dbClient.subscribe(topic);
        if(response.code !== ProtocolCode.OK) throw new Error(response.message);
        this.processes.set(topic, processor);
    }
}

export default Worker;
