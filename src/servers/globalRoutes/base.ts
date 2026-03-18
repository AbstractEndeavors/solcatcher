export async function getBaseCall(app:any,service:string | null='api server'){
  app.get("/", (_req, res) => {
      res.json({
        ok: true,
        service,
        uptime: process.uptime(),
      });
    });
  return app;
}
