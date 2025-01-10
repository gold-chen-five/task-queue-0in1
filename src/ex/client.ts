import 'module-alias/register';
import allInOne from "@/all-in-one";

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
        const data = client.parseResponseList(response);
        console.log(data);

        const resPop = await client.lPopFront("test");
        const dataPop = client.parseResponseString(resPop);
        console.log(dataPop)

        const response2 = await client.get("test");
        const data2 = client.parseResponseList(response2);
        console.log(data2);


        const finish = new Date();
        console.log(finish.getTime() - now.getTime(), "ms");
    } catch(err) {
        console.log(err)
    }
}

main();
