import { FetchManager } from "./FetchManager.js";
export declare function initFetchManager(ratelimiter?: any, commitment?: any): Promise<FetchManager>;
export declare function getFetchManager(): Promise<FetchManager>;
export declare function getFetchManagerStatus(): {
    initialized: boolean;
    initializing: boolean;
};
