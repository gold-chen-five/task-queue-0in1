import 'module-alias/register';
import allInOne from "@/all-in-one";
import { ProtocolCode } from "@/database/protocol.type";

async function main(){
    const client = allInOne.createClient();

    const URL = "inmemory://localhost:3000"
    await client.connect(URL);

    const resposne = await client.publish("test");
    if(resposne.code !== ProtocolCode.OK) throw new Error(resposne.message);

    client.close();
}

try {
    main()
} catch(err){
    console.error(err);
}
