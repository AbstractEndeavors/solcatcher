// utils/pause.ts
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getRl(rl:any) {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return rl;
}



function waitForEnter() {
  return new Promise<void>(resolve =>
    rl.question('⏸ Press Enter to continue…', () => resolve())
  );
}


export async function messageCheck(mesage:any,object:any){
  console.log(mesage,object)
  await waitForEnter()
}

export function jsonSafeStringify(
  value: unknown,
  space?: number
): string {
  return JSON.stringify(
    value,
    (_, v) => (typeof v === 'bigint' ? v.toString() : v),
    space
  );
}
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