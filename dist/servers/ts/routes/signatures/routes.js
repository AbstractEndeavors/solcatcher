import { getRepoServices } from "./../imports.js";
export async function getSigntaureCalls(app) {
    app.get("/signtaures/:account", async (req, res) => {
        const { signaturesRepo } = await getRepoServices.repos();
        res.json(await signaturesRepo.getExistingSignatures(req.params.account));
    });
    return app;
}
