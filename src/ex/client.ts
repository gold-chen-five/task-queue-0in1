import { createAllInOneClient } from "../all-in-one";

const URL = "inmemory://localhost:3000";
const client = createAllInOneClient();
client.connect(URL);