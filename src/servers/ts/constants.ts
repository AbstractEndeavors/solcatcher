import {getEnvValue} from '@putkoff/abstract-env';
export const TS_HOST = getEnvValue({ key: "SOLCATCHER_TS_SERVER_HOST" }) || "0.0.0.0";
export const TS_PORT = getEnvValue({ key: "SOLCATCHER_TS_SERVER_PORT" }) || 6043;
