import express from "express";
import fetch from "node-fetch";
export {LIMITER_URL} from './../constants.js';
export {getPubkey,normalizeBase58} from '@imports'
import type {} from '@imports';
export type {MintLike,SigLike,LimitLike,AddressLike,IntLike,DataLike,IdLike,StringLike,SignatureDict,Commitment,FetchIntent,Encoding,FetchTxnParams,GetInsertDataParams } from '@imports';

export function readPublicInput<T = any>(req: any): T {
  const src = req.method === "GET" ? req.query : req.body;

  // normalize numeric strings
  for (const k in src) {
    if (typeof src[k] === "string" && /^\d+$/.test(src[k])) {
      src[k] = Number(src[k]);
    }
  }

  return src as T;
}
export const asyncHandler =
  (fn: Function) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
export {express,fetch} 



export function getResult<T = any>(res: any): T | null {
  if (res == null) return null;

  if (typeof res === "object" && "result" in res) {
    return res.result as T;
  }

  if (typeof res === "object" && "value" in res) {
    return res.value as T;
  }

  return res as T;
}