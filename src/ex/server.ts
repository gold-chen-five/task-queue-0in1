import 'module-alias/register';
import allInOne from "@/all-in-one";

const PORT = 3000;
const db = allInOne.createServer();
db.start(PORT);