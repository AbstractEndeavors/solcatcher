
export const inflightRegistry = new Map<string, Promise<any>>();
export const DEFAULT_COMMITMENT = "confirmed";
export const DEFAULT_HEADERS =  { 'Content-Type': 'application/json' }