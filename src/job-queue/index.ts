import database from "@/database";
import JobQueue from "./job-queue";
import Worker from "./worker";

export async function createJobQueue(dbUrl: string){
    const client = database.createClient();
    await client.connect(dbUrl);
    return new JobQueue(client);
}


export async function createWorker(dbUrl: string){
    const client = database.createClient();
    await client.connect(dbUrl);
    return new Worker(client);
}