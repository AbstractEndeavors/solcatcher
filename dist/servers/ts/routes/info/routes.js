import { initializeRegistry } from '@imports';
import { Router } from "express";
const router = Router();
const DECODER_REGISTRY = initializeRegistry();
/*router.post("/processParsedLogs", async (req, res) => {
  try {
    const {logs} = req.body; // <-- THIS is the input
    const result = parseProgramLogs(logs);
    res.json({ result });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/getTcns", async (req, res) => {
  try {
    const { signature, slot, program_id, parsedLogs, id: log_id } = req.body;

    const result = await getTcns({
      signature,
      slot,
      program_id,
      parsedLogs,
      log_id
    });

    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router
  .route("/decodedata")
  .get(handleFetchMetaData)
  .post(handleFetchMetaData);
  
async function handleFetchMetaData(req: any, res: any) {
  const {data} = req.body;
  const raw = Buffer.from(data, "base64");
  let decodedData:DataLike = DECODER_REGISTRY.decode(raw);
  res.json({ result: decodedData });
}
*/
export default router;
