import { getFullStatus, logs, broadcastMetrics } from './imports/index.js';
import WebSocket from 'ws';
const { Server: WebSocketServer } = WebSocket;
const wsClients = new Set();
let wss = null;
export function initWebSocket(server) {
    wss = new WebSocketServer({ server, path: '/ws/pipeline' });
    wss.on('connection', (ws) => {
        wsClients.add(ws);
        // Send initial state
        ws.send(JSON.stringify({
            type: 'init',
            payload: {
                status: getFullStatus(),
                logs: logs.slice(0, 100),
            },
        }));
        ws.on('close', () => {
            wsClients.delete(ws);
        });
        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }
            }
            catch {
                // Ignore
            }
        });
    });
    // Start metrics broadcast interval
    setInterval(broadcastMetrics, 1000);
}
