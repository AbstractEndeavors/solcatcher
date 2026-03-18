import {convertBigInts} from '@imports';
function safeConvertBigInt(obj: any) {
  try {
    return convertBigInts(obj);
  } catch {
    return obj;
  }
}
export function safeEstimateSize(obj:any){
    obj = safeConvertBigInt(obj)
    try {
      return Buffer.byteLength(
        JSON.stringify(obj),
        "utf8"
      ) / 1024 / 1024;
    } catch {
      return 0;
    }
}