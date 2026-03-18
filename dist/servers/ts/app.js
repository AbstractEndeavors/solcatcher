// src/servers/api/index.ts (your existing file, updated)
import express from "express";
import { getTransactionCalls, getSigntaureCalls, getPipelineCalls, getPairCalls, getMetaDataCalls, getLogDataCalls, getChartCalls, initWebSocket } from './routes/index.js';
import { getEndpointsCalls, getBaseCall } from './../globalRoutes/index.js';
const service = "solcatcher-api";
export async function serverApp() {
    let app = express();
    app.use(express.json());
    app = await getBaseCall(app);
    app = await getTransactionCalls(app);
    app = await getSigntaureCalls(app);
    app = await getPipelineCalls(app);
    app = await getPairCalls(app);
    app = await getMetaDataCalls(app);
    app = await getLogDataCalls(app);
    app = await getChartCalls(app);
    app = await getEndpointsCalls(app, service);
    return app;
}
