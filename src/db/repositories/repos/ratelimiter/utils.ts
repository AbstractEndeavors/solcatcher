/**
 * RATE LIMITER UTILITIES
 * 
 * Pure functions for rate limiting logic.
 * No side effects, no mutation, no file I/O.
 */

import { RpcPayload } from './schemas.js';

// ============================================================
// TIME UTILITIES
// ============================================================

export function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

export function isTimeInterval(timeObj: number, interval: number): boolean {
  return getCurrentTime() - timeObj < interval - 1;
}

// ============================================================
// SIZE UTILITIES
// ============================================================

export function getJsonSizeInMb(data: unknown): number {
  if (!data) return 0;

  const jsonStr = JSON.stringify(data);
  if (!jsonStr) return 0;

  const sizeInBytes = new Blob([jsonStr]).size;
  const sizeInMb = sizeInBytes / (1024 * 1024);

  return sizeInMb;
}

export function getDataSize(data: unknown): number {
  if (!data) return 0;

  let size: number;

  if (typeof data === 'string') {
    size = new Blob([data]).size;
  } else if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
    size = data.byteLength;
  } else if (Array.isArray(data) || typeof data === 'object') {
    size = new Blob([JSON.stringify(data)]).size;
  } else {
    size = new Blob([String(data)]).size;
  }

  return size / 1000;
}

// ============================================================
// URL UTILITIES
// ============================================================

export function parseUrl(url: string): {
  netloc: string;
  scheme: string;
  name: string;
  ext: string;
} | null {
  try {
    const parsed = new URL(url);
    const netloc = parsed.hostname;
    const lastDotIndex = netloc.lastIndexOf('.');
    const name = lastDotIndex > 0 ? netloc.substring(0, lastDotIndex) : netloc;
    const ext = lastDotIndex > 0 ? netloc.substring(lastDotIndex) : '';
    const scheme = parsed.protocol.replace(':', '');

    return { netloc, scheme, name, ext };
  } catch (e) {
    console.error(`Failed to parse URL: ${url}`, e);
    return null;
  }
}

export function getBaseDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (e) {
    console.error(`Failed to parse URL: ${url}`, e);
    return '';
  }
}
// ============================================================
// HEADER UTILITIES
// ============================================================

type HeaderLike =
  | Headers
  | Response
  | Record<string, string | number | string[] | undefined>
  | Iterable<[string, string]>;

export function normalizeHeaders(input: HeaderLike): Headers {
  if (input instanceof Headers) {
    return input;
  }

  if (input instanceof Response) {
    return input.headers;
  }

  // Iterable (undici, fetch internals)
  if (Symbol.iterator in Object(input)) {
    return new Headers(Array.from(input as Iterable<[string, string]>));
  }

  // Plain object (axios, mocks, custom)
  const headers = new Headers();
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      headers.set(key, value.join(','));
    } else {
      headers.set(key, String(value));
    }
  }

  return headers;
}
// ============================================================
// HEADER UTILITIES
// ============================================================

export function getResponseHeaders(response: Response | Headers): Headers {
  if (response instanceof Response) {
    return response.headers;
  }
  return response;
}
export function getRetryAfter(response: HeaderLike): number {
  const h = normalizeHeaders(response);
  const v = h.get('retry-after');
  return v ? Number(v) || 0 : 0;
}

export function getRemainingMethod(response: HeaderLike): number {
  const h = normalizeHeaders(response);
  const v = h.get('x-ratelimit-method-remaining');
  return v ? Number(v) || -1 : -1;
}

export function getMethodRateLimit(response: HeaderLike): number {
  const h = normalizeHeaders(response);
  const v = h.get('x-ratelimit-method-limit');
  return v ? Number(v) || 0 : 0;
}

export function getRpsLimit(response: HeaderLike): number {
  const h = normalizeHeaders(response);
  const v = h.get('x-ratelimit-rps-limit');
  return v ? Number(v) || 0 : 0;
}
// ============================================================
// RPC UTILITIES
// ============================================================

export function createRpcPayload(
  method: string,
  params: unknown[] = [],
  id: string | number = 1,
  jsonrpc: string = '2.0'
): RpcPayload {
  return new RpcPayload(
    jsonrpc,
    typeof id === 'number' ? id : parseInt(id, 10),
    method,
    params
  );
}

// ============================================================
// RATE LIMIT CHECKING LOGIC
// ============================================================

export interface RateLimitEntry {
  method: string;
  data: number;
  time: number;
}

export function cleanQueries(
  priorQueries: RateLimitEntry[],
  interval: number
): RateLimitEntry[] {
  const timeIntervalCutoff = getCurrentTime() - interval;
  return priorQueries.filter((query) => query.time >= timeIntervalCutoff);
}

export function isRequestPerSingleRpc(
  priorQueries: RateLimitEntry[],
  method: string,
  maxRequests: number,
  interval: number
): number | false {
  const timeIntervalCutoff = getCurrentTime() - interval;

  const qualifyingRequests = priorQueries
    .filter(
      (query) => query.method === method && query.time >= timeIntervalCutoff
    )
    .map((query) => query.time);

  const lenQualifying = qualifyingRequests.length;

  if (lenQualifying >= maxRequests) {
    const out =
      qualifyingRequests[lenQualifying - maxRequests] - timeIntervalCutoff;
    console.log(
      `request_per_single_rpc ${lenQualifying} of ${maxRequests} hit within ${interval} seconds sending ${out}`
    );
    return out;
  }

  return false;
}

export function isRequestPerSingleIp(
  priorQueries: RateLimitEntry[],
  maxRequests: number,
  interval: number
): number | false {
  const timeIntervalCutoff = getCurrentTime() - interval;

  const qualifyingRequests = priorQueries
    .filter((query) => query.time >= timeIntervalCutoff)
    .map((query) => query.time);

  const lenQualifying = qualifyingRequests.length;

  if (lenQualifying >= maxRequests) {
    console.log(
      `request_per_single_ip ${lenQualifying} of limit ${maxRequests} hit within ${interval} seconds`
    );
    return (
      qualifyingRequests[lenQualifying - maxRequests] - timeIntervalCutoff
    );
  }

  return false;
}

export function isDataPerIp(
  priorQueries: RateLimitEntry[],
  maxData: number,
  interval: number,
  avgData: number
): number | false {
  const timeIntervalCutoff = getCurrentTime() - interval;

  const relevantQueries = priorQueries.filter(
    (query) => query.time >= timeIntervalCutoff
  );
  let totalData =
    relevantQueries.reduce((sum, query) => sum + (query.data || 0), 0) +
    avgData;

  if (totalData >= maxData) {
    let targetTime = priorQueries[0]?.time || getCurrentTime();
    console.log(
      `data_per_ip ${totalData} of limit ${maxData} hit within ${interval} seconds`
    );

    if (avgData) {
      const targetData = maxData - avgData;
      for (const data of priorQueries) {
        totalData -= data.data || 0;
        if (totalData <= targetData) {
          targetTime = data.time;
          break;
        }
      }
    }

    return targetTime - timeIntervalCutoff;
  }

  return false;
}

export function getIsLimit(
  priorQueries: RateLimitEntry[],
  method: string = 'default_method',
  rateLimit: number = 40,
  rpsLimit: number = 100,
  interval: number = 10,
  dataInterval: number = 30,
  dataLimit: number = 100,
  avgData: number | null = null
): number | false {
  const requestPerSingleRpc = isRequestPerSingleRpc(
    priorQueries,
    method,
    rateLimit,
    interval
  );
  if (requestPerSingleRpc !== false) {
    return requestPerSingleRpc;
  }

  const requestPerSingleIp = isRequestPerSingleIp(
    priorQueries,
    rpsLimit,
    interval
  );
  if (requestPerSingleIp !== false) {
    return requestPerSingleIp;
  }

  const dataPerSingleIp = isDataPerIp(
    priorQueries,
    dataLimit,
    dataInterval,
    avgData || 0
  );
  if (dataPerSingleIp !== false) {
    return dataPerSingleIp;
  }

  return false;
}
