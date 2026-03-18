import { createServer } from "http";
import { serverApp } from "./app.js";
import { TS_HOST, TS_PORT } from './constants.js';
export async function startSolcatcherServer(port = null, host = null) {
    host = host || TS_HOST;
    port = parseInt(port || TS_PORT);
    const app = await serverApp();
    createServer(app).listen(port, host, () => {
        console.log(`TS server running on ${host}:${port}`);
    });
}
