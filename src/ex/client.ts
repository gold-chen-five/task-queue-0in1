import { createAllInOneClient } from "../all-in-one";

async function main(){
    const URL = "inmemory://localhost:3000";
    const client = createAllInOneClient();
    client.connect(URL);
    await client.set("test", ["test"]);
    const response = await client.get("test");
   console.log(response)
}

main();
