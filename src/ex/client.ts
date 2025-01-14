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
    worker.register<Payload>(topic, async(job) => {
        return new Promise((resolve, reject) => {
            console.log(job)
            setTimeout(() => resolve(), 2000);
        });
    });

    const payload: Payload ={
        name: "jonas",
        age: 27
    };

    const job = await jobQueue.add(topic, payload);
    jobQueue.add(topic, payload);
    jobQueue.add(topic, payload);
    jobQueue.add(topic, payload);
    jobQueue.add(topic, payload);
    
}

main()
    .then(() => {})
    .catch((err: any) => {
        console.log(err.message);
    })