import { getEnvValue } from '@putkoff/abstract-env';
export const LIMITER_URL = "https://solcatcher.io/ratelimiter";
export const LIMITER_HOST = getEnvValue({ key: "SOLCATCHER_TS_LIMITER_HOST" }) || "0.0.0.0";
export const LIMITER_PORT = getEnvValue({ key: "SOLCATCHER_TS_LIMITER_PORT" }) || 6048;
