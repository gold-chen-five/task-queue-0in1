import 'module-alias/register';
import database, { ProtocolCode } from '@/database';

async function main(){
    const client = database.createClient();

    const URL = "inmemory://localhost:3000"
    await client.connect(URL);

    const resposne = await client.subscribe("test");

    if(resposne.code !== ProtocolCode.OK) throw new Error("Sunscribe fail");


    client.listenChannel(() => {
        console.log("get annotation")
    });
}

try {
    main()
} catch(err){
    console.error(err);
}
