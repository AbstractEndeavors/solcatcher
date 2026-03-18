export function extractData(data) {
    return Array.isArray(data) && data.length === 1 ? data[0] : data;
}
