import 'module-alias/register';
import allInOne from "@/all-in-one";
import { ProtocolCode } from "@/database/protocol.type";

async function main(){
    console.log("asd")
    const client = allInOne.createClient();

    const URL = "inmemory://localhost:3000"
    await client.connect(URL);

    const resposne = await client.subscribe("test");

    if(resposne.code !== ProtocolCode.OK) throw new Error("Sunscribe fail");


    client.listenChannel("test", () => {
        console.log("get annotation")
    });
}

try {
    main()
} catch(err){
    console.error(err);
}
