export { pathToFileURL } from "url";
export function parseUrl(input) {
    if (typeof input === "string") {
        return new URL(input);
    }
    if (typeof input === "object" && input.scheme && input.netloc) {
        return new URL(`${input.scheme}://${input.netloc}`);
    }
    throw new Error(`Failed to parse URL: ${String(input)}`);
}
export function urlToString(url) {
    if (typeof url === "string")
        return url;
    const scheme = url.scheme ?? 'https';
    const netloc = url.netloc ?? '';
    const path = url.path ?? '';
    return `${scheme}://${netloc}${path}`;
}
export function urlToDict(input) {
    if (typeof input === "string") {
        const u = new URL(input);
        return {
            identifier: u.hostname,
            scheme: u.protocol.replace(":", ""),
            netloc: u.hostname,
            path: u.pathname && u.pathname !== "/" ? u.pathname : undefined, // 🔑
            name: u.hostname,
            ext: "default",
        };
    }
    if (!input.scheme || !input.netloc) {
        throw new Error(`[urlToDict] Invalid URL object: ${JSON.stringify(input)}`);
    }
    return {
        identifier: input.identifier ?? input.netloc,
        scheme: input.scheme,
        netloc: input.netloc,
        path: input.path, // 🔑 PRESERVE
        name: input.name ?? input.netloc,
        ext: input.ext ?? "default",
    };
}
export function normalizeUrlInput(input) {
    console.log("[RateLimiter] URL INPUT:", input);
    if (typeof input === "string") {
        const parsed = new URL(input);
        const normalized = {
            identifier: parsed.hostname,
            scheme: parsed.protocol.replace(":", ""),
            netloc: parsed.hostname,
            url: input,
        };
        console.log("[RateLimiter] NORMALIZED (string):", normalized);
        return normalized;
    }
    if (!input.scheme || !input.netloc || !input.identifier) {
        throw new Error(`[RateLimiter] Invalid URL object: ${JSON.stringify(input)}`);
    }
    const url = `${input.scheme}://${input.netloc}`;
    const normalized = {
        identifier: input.identifier,
        scheme: input.scheme,
        netloc: input.netloc,
        url,
    };
    console.log("[RateLimiter] NORMALIZED (object):", normalized);
    return normalized;
}
export function getBaseDomain(input) {
    if (typeof input === "string") {
        return new URL(input).hostname.replace(/^www\./, "");
    }
    if (!input.scheme || !input.netloc) {
        throw new Error(`[getBaseDomain] Invalid input: ${JSON.stringify(input)}`);
    }
    return new URL(`${input.scheme}://${input.netloc}`)
        .hostname
        .replace(/^www\./, "");
}
