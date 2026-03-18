import { getLogString } from './../../module_imports.js';
export function getSafeLength(value) {
    try {
        if (value == null)
            return 0;
        if (typeof value.length === "number") {
            return value.length;
        }
        if (value instanceof Map || value instanceof Set) {
            return value.size;
        }
        if (typeof value === "object") {
            return Object.keys(value).length;
        }
        return 0;
    }
    catch (err) {
        getLogString({
            logType: "error",
            message: "getSafeLength failed",
            details: { valueType: typeof value, error: err.message },
        });
        return 0;
    }
}
