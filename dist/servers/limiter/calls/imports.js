import express from "express";
import fetch from "node-fetch";
export { LIMITER_URL } from './../constants.js';
export { getPubkey, normalizeBase58 } from '@imports';
export function readPublicInput(req) {
    const src = req.method === "GET" ? req.query : req.body;
    // normalize numeric strings
    for (const k in src) {
        if (typeof src[k] === "string" && /^\d+$/.test(src[k])) {
            src[k] = Number(src[k]);
        }
    }
    return src;
}
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export { express, fetch };
export function getResult(res) {
    if (res == null)
        return null;
    if (typeof res === "object" && "result" in res) {
        return res.result;
    }
    if (typeof res === "object" && "value" in res) {
        return res.value;
    }
    return res;
}
