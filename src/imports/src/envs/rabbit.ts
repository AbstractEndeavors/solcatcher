// src/env/rabbit.ts
import { requireEnv } from './imports/index.js';
export function loadRabbitEnv() {
  const host = requireEnv("SOLCATCHER_AMQP_HOST", "127.0.0.1");
  const port = parseInt(requireEnv("SOLCATCHER_AMQP_PORT", "6044"), 10);
  const user = requireEnv("SOLCATCHER_AMQP_USER");
  const password = requireEnv("SOLCATCHER_AMQP_PASS");
  const vhost = requireEnv("SOLCATCHER_AMQP_VHOST");
  const url = `amqp://${user}:${password}@${host}:${port}/${vhost}`;
  const out = { host, port, user, password, vhost, url };
  return out;
}
