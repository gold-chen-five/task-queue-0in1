import 'module-alias/register';
import database from '@/database';

const PORT = 3000;
const db = database.createServer();
db.start(PORT);