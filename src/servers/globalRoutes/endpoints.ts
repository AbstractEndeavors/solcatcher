export async function getEndpointsCalls(app:any,service:string | null='api server'){
  app.get("/endpoints", (_req, res) => {
      const routes: any[] = [];
      
      // Extract all routes from Express app
      app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          // Single route
          const methods = Object.keys(middleware.route.methods)
            .filter(method => middleware.route.methods[method])
            .map(m => m.toUpperCase());
          
          routes.push({
            path: middleware.route.path,
            methods: methods,
          });
        } else if (middleware.name === 'router') {
          // Router middleware
          middleware.handle.stack.forEach((handler: any) => {
            if (handler.route) {
              const methods = Object.keys(handler.route.methods)
                .filter(method => handler.route.methods[method])
                .map(m => m.toUpperCase());
              
              routes.push({
                path: handler.route.path,
                methods: methods,
              });
            }
          });
        }
      });
      
      // Sort by path
      routes.sort((a, b) => a.path.localeCompare(b.path));
      
      res.json({
        service,
        endpoint_count: routes.length,
        endpoints: routes,
      });
    });
    app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const ms = Date.now() - start;
      console.log(
        `[${service} API] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`
      );
    });

    next();
  });
return app
}
