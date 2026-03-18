
import {getEnvValue} from "./../../module_imports.js";
export function requireEnv(key: string, fallback?: string): string {
  const val = getEnvValue({ key,startPath:"/var/www/ABSTRACT_ENDEAVORS/scripts/RABBIT/aggregator/.env" }) ?? fallback;
  if (!val) throw new Error(`❌ Missing env var: ${key}`);
  return val;
}
