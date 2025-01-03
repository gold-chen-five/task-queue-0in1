import InMemoryDBServer from "./database/db-server";

const PORT = 3000;
const inMemoryDBServer = new InMemoryDBServer();
inMemoryDBServer.start(PORT);