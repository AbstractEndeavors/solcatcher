import { pipelineState, getFullStatus, requirePipeline, broadcastMetrics, broadcastClearLogs, logs } from './imports/index.js';
// ────────────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────────────
export async function getPipelineCalls(app) {
    // Health check (no pipeline required)
    app.get('/health', (req, res) => {
        res.json({
            status: pipelineState ? 'ok' : 'no_pipeline',
            uptime: pipelineState ? Date.now() - pipelineState.startTime : 0,
        });
    });
    // Full status
    app.get('/status', requirePipeline, (req, res) => {
        res.json(getFullStatus());
    });
    // ────────────────────────────────────────────────────────
    // GLOBAL CONTROLS
    // ────────────────────────────────────────────────────────
    app.post('/control/pause', requirePipeline, async (req, res) => {
        try {
            for (const [name, consumer] of pipelineState.consumers) {
                if (pipelineState.consumerStatus.get(name) === 'running') {
                    await consumer.pause?.();
                    pipelineState.consumerStatus.set(name, 'paused');
                }
            }
            for (const [name, worker] of pipelineState.workers) {
                if (pipelineState.workerStatus.get(name) === 'running') {
                    await worker.pause?.();
                    pipelineState.workerStatus.set(name, 'paused');
                }
            }
            pipelineState.status = 'paused';
            broadcastMetrics();
            res.json({ success: true, status: 'paused' });
        }
        catch (err) {
            res.status(500).json({ error: String(err) });
        }
    });
    app.post('/control/resume', requirePipeline, async (req, res) => {
        try {
            for (const [name, consumer] of pipelineState.consumers) {
                if (pipelineState.consumerStatus.get(name) === 'paused') {
                    await consumer.resume?.();
                    pipelineState.consumerStatus.set(name, 'running');
                }
            }
            for (const [name, worker] of pipelineState.workers) {
                if (pipelineState.workerStatus.get(name) === 'paused') {
                    await worker.resume?.();
                    pipelineState.workerStatus.set(name, 'running');
                }
            }
            pipelineState.status = 'running';
            broadcastMetrics();
            res.json({ success: true, status: 'running' });
        }
        catch (err) {
            res.status(500).json({ error: String(err) });
        }
    });
    // ────────────────────────────────────────────────────────
    // QUEUE CONTROLS
    // ────────────────────────────────────────────────────────
    app.post('/queue/:name/pause', requirePipeline, async (req, res) => {
        const name = req.params.name;
        const consumer = pipelineState.consumers.get(name);
        if (!consumer) {
            return res.status(404).json({ error: 'Queue not found' });
        }
        try {
            await consumer.pause?.();
            pipelineState.consumerStatus.set(name, 'paused');
            broadcastMetrics();
            res.json({ success: true, queue: name, status: 'paused' });
        }
        catch (err) {
            res.status(500).json({ error: String(err) });
        }
    });
    app.post('/queue/:name/resume', requirePipeline, async (req, res) => {
        const name = req.params.name;
        const consumer = pipelineState.consumers.get(name);
        if (!consumer) {
            return res.status(404).json({ error: 'Queue not found' });
        }
        try {
            await consumer.resume?.();
            pipelineState.consumerStatus.set(name, 'running');
            broadcastMetrics();
            res.json({ success: true, queue: name, status: 'running' });
        }
        catch (err) {
            res.status(500).json({ error: String(err) });
        }
    });
    app.get('/queue/:name/metrics', requirePipeline, (req, res) => {
        const name = req.params.name;
        const consumer = pipelineState.consumers.get(name);
        if (!consumer) {
            return res.status(404).json({ error: 'Queue not found' });
        }
        res.json({
            name,
            status: pipelineState.consumerStatus.get(name),
            metrics: consumer.getMetrics?.() || {},
        });
    });
    // ────────────────────────────────────────────────────────
    // WORKER CONTROLS
    // ────────────────────────────────────────────────────────
    app.post('/worker/:name/pause', requirePipeline, async (req, res) => {
        const name = req.params.name;
        const worker = pipelineState.workers.get(name);
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        try {
            await worker.pause?.();
            pipelineState.workerStatus.set(name, 'paused');
            broadcastMetrics();
            res.json({ success: true, worker: name, status: 'paused' });
        }
        catch (err) {
            res.status(500).json({ error: String(err) });
        }
    });
    app.post('/worker/:name/resume', requirePipeline, async (req, res) => {
        const name = req.params.name;
        const worker = pipelineState.workers.get(name);
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        try {
            await worker.resume?.();
            pipelineState.workerStatus.set(name, 'running');
            broadcastMetrics();
            res.json({ success: true, worker: name, status: 'running' });
        }
        catch (err) {
            res.status(500).json({ error: String(err) });
        }
    });
    app.post('/worker/:name/tick', requirePipeline, async (req, res) => {
        const name = req.params.name;
        const worker = pipelineState.workers.get(name);
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        try {
            await worker.tickNow?.();
            broadcastMetrics();
            res.json({ success: true, worker: name });
        }
        catch (err) {
            res.status(500).json({ error: String(err) });
        }
    });
    app.get('/worker/:name/metrics', requirePipeline, (req, res) => {
        const name = req.params.name;
        const worker = pipelineState.workers.get(name);
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        res.json({
            name,
            status: pipelineState.workerStatus.get(name),
            metrics: worker.getMetrics?.() || {},
        });
    });
    app.get('/logs', (req, res) => {
        const limit = parseInt(req.query.limit) || 100;
        const level = req.query.level;
        const queue = req.query.queue;
        let filtered = logs;
        if (level && level !== 'all') {
            filtered = filtered.filter(l => l.level === level);
        }
        if (queue) {
            filtered = filtered.filter(l => l.queue === queue);
        }
        res.json(filtered.slice(0, limit));
    });
    app.delete('/logs', (req, res) => {
        logs.length = 0;
        broadcastClearLogs();
        res.json({ success: true });
    });
    return app;
}
