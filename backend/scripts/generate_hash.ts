import { bcrypt } from "../deps.ts";

const password = "Admin@123";
const hash = await bcrypt.hash(password);
console.log(`Password: ${password}`);
console.log(`Hash: ${hash}`);
