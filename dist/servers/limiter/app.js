import { express } from './calls/imports.js';
/**
 * ADD THIS TO YOUR limiterApp() FUNCTION
 *
 * This creates a /endpoints route that lists all registered routes
 */
import { getRpcCalls, getAccountInfoCalls, getBalanceCalls, getTransactionCalls, getSignatureCalls, getMetaDataCalls, getUrlCalls } from './calls/index.js';
import { getEndpointsCalls, getBaseCall } from './../globalRoutes/index.js';
const service = "rate-limiter";
export async function limiterApp(limiter) {
    let app = express();
    app.use(express.json());
    app = await getBaseCall(app, service);
    app = await getUrlCalls(limiter, app);
    app = await getAccountInfoCalls(limiter, app);
    app = await getRpcCalls(limiter, app);
    app = await getBalanceCalls(limiter, app);
    app = await getTransactionCalls(limiter, app);
    app = await getSignatureCalls(limiter, app);
    app = await getMetaDataCalls(limiter, app);
    app = await getEndpointsCalls(app, service);
    return app;
}
