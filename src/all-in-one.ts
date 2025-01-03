import InMemoryDB from "./database/in-memory-db";
import InMemoryDBServer from "./database/db-server";
import InMemoryDBClient from "./database/db-client";

export function createAllInOneDB(): InMemoryDBServer {
    const inMemoryDB = new InMemoryDB();
    const inMemoryDBServer = new InMemoryDBServer(inMemoryDB);
    return inMemoryDBServer;
}

export function createAllInOneClient(): InMemoryDBClient {
    return new InMemoryDBClient();
}   



