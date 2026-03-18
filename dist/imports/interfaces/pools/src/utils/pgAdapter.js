export function adaptPgPool(pool) {
    return {
        query(sql, params) {
            // force the typed overload
            return pool.query(sql, params);
        },
        async connect() {
            const client = await pool.connect();
            return {
                query: client.query.bind(client),
                release: client.release.bind(client),
            };
        },
        end() {
            return pool.end();
        },
    };
}
