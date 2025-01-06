import InMemoryDB from "./database/in-memory-db";
import InMemoryDBServer from "./database/db-server";
import InMemoryDBClient from "./database/db-client";
import Protocol from "./database/protocol";

export function createAllInOneDB(): InMemoryDBServer {
    const protocol = new Protocol();
    const inMemoryDB = new InMemoryDB();
    const inMemoryDBServer = new InMemoryDBServer(inMemoryDB, protocol);
    return inMemoryDBServer;
}

export function createAllInOneClient(): InMemoryDBClient {
    const protocol = new Protocol();
    return new InMemoryDBClient(protocol);
}   



