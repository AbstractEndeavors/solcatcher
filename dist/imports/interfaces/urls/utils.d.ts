import type { UrlDict, UrlParsed } from './types.js';
export { pathToFileURL } from "url";
export declare function parseUrl(input: string | {
    scheme: string;
    netloc: string;
}): URL;
export declare function urlToString(url: UrlDict | string): string;
export declare function urlToDict(input: string | Partial<UrlDict>): UrlDict;
export declare function normalizeUrlInput(input: UrlParsed): {
    identifier: string;
    scheme: string;
    netloc: string;
    url: string;
};
export declare function getBaseDomain(input: string | {
    scheme: string;
    netloc: string;
} | UrlDict): string;
