// utils/pause.ts
import readline from "node:readline";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function getRl(rl) {
    if (!rl) {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }
    return rl;
}
function waitForEnter() {
    return new Promise(resolve => rl.question('⏸ Press Enter to continue…', () => resolve()));
}
export async function messageCheck(mesage, object) {
    console.log(mesage, object);
    await waitForEnter();
}
export function jsonSafeStringify(value, space) {
    return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), space);
}
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
