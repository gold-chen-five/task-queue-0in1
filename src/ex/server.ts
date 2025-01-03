import { createAllInOneDB } from "../all-in-one";

const PORT = 3000;
const db = createAllInOneDB()
db.start(PORT);