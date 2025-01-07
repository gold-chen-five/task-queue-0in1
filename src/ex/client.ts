import allInOne from "../all-in-one";

async function main(){
    try {
        const URL = "inmemory://localhost:3000";
        const client = allInOne.createClient();
        const success = await client.connect(URL);
        console.log(success)
    
        const now = new Date();
        //await client.set("test", "hello");
        const arr = [...Array(10).keys()].map(i => `hello${i}`);
        await client.lPushBack("test", arr);
        const response = await client.get("test");
        console.log(response)
        const data = client.toStringList(response.data);
        console.log(data);
    
        const finish = new Date();
        console.log(finish.getTime() - now.getTime(), "ms");
    } catch(err) {
        console.log(err)
    }
}

main();
