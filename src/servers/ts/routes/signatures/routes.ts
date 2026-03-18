import { getDeps} from "@repoServices";

export async function getSigntaureCalls(app:any) {
  app.get("/signtaures/:account", async (req, res) => {
    const {signaturesRepo} = await getDeps.repos()
    res.json(await signaturesRepo.getExistingSignatures(req.params.account));
  });
  return  app;
}
