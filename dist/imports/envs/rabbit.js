// src/env/rabbit.ts
import { getEnvValue, ENVPATH } from './imports.js';
let RabbitDisplayed = false;
function requireEnv(key, fallback) {
    const val = getEnvValue({ key, startPath: ENVPATH }) ?? fallback;
    if (!val)
        throw new Error(`❌ Missing env var: ${key}`);
    return val;
}
export function loadRabbitEnv() {
    const host = requireEnv("SOLCATCHER_AMQP_HOST", "127.0.0.1");
    const port = parseInt(requireEnv("SOLCATCHER_AMQP_PORT", "6044"), 10);
    const user = requireEnv("SOLCATCHER_AMQP_USER");
    const password = requireEnv("SOLCATCHER_AMQP_PASS");
    const vhost = requireEnv("SOLCATCHER_AMQP_VHOST");
    const url = `amqp://${user}:${password}@${host}:${port}/${vhost}`;
    const out = { host, port, user, password, vhost, url };
    /*if (RabbitDisplayed == false){
      console.log("🐇 Rabbit config:", out);
      RabbitDisplayed=true
    }*/
    return out;
}
