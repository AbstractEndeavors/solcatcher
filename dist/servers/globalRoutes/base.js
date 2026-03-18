export async function getBaseCall(app, service = 'api server') {
    app.get("/", (_req, res) => {
        res.json({
            ok: true,
            service,
            uptime: process.uptime(),
        });
    });
    return app;
}
