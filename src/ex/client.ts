import 'module-alias/register';
import { createJobQueue, createWorker } from '@/job-queue';

const URL = "inmemory://localhost:3000"

type Payload = {
    name: string,
    age: number
}

async function main() {
    const jobQueue = await createJobQueue(URL);
    const worker = await createWorker(URL);
    
    const topic = "test"
    worker.process<Payload>(topic, async(job) => {
        console.log(job.payload.name);
        console.log(job);
    });

    const payload: Payload ={
        name: "jonas",
        age: 27
    };

    const job = await jobQueue.add(topic, payload);
    
    
}

main()
    .then(() => {})
    .catch((err: any) => {
        console.log(err.message);
    })