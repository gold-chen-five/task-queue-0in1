import database from "@/database";
import { createJobQueue, createWorker } from "@/job-queue";

/**
 * 
 * @param connection database url ex:inmemory://localhost:3000
 */
async function createQueue(connection: string){
    const worker = await createWorker(connection);
}

