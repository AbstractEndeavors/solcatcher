import {getLogString} from './../../module_imports.js';
export function getSafeLength(value: unknown): number {
  try {
    if (value == null) return 0;

    if (typeof (value as any).length === "number") {
      return (value as any).length;
    }

    if (value instanceof Map || value instanceof Set) {
      return value.size;
    }

    if (typeof value === "object") {
      return Object.keys(value as object).length;
    }

    return 0;
  } catch (err: any) {
    getLogString({
      logType: "error",
      message: "getSafeLength failed",
      details: { valueType: typeof value, error: err.message },
    });
    return 0;
  }
}
