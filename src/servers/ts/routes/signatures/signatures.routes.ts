import { Router } from "express";
import {  getRepoServices} from "@repoServices";

const router = Router();

router.get("signatures/:account", async (req, res) => {
  const {signaturesRepo} = await getRepoServices.repos()
  res.json(await signaturesRepo.getExistingSignatures(req.params.account));
});

export default router;
