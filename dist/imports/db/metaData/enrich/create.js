import {} from './imports.js';
import { onchainEnrich, offChainEnrich, metaDataEnrich } from './enrich.js';
/* -------------------------------------------------- */
/* Handler factory                                    */
/* -------------------------------------------------- */
export function createOnChainMetaDataEnrichHandler(deps) {
    return (payload) => onchainEnrich(payload, deps);
}
/* -------------------------------------------------- */
/* Handler factory                                    */
/* -------------------------------------------------- */
export function createOffChainMetaDataEnrichHandler(deps) {
    return (payload) => offChainEnrich(payload, deps);
}
/* -------------------------------------------------- */
/* Handler factory                                    */
/* -------------------------------------------------- */
export function createMetaDataEnrichHandler(deps) {
    return (payload) => metaDataEnrich(payload, deps);
}
