// src/pipeline/transport/connection.ts
import amqp from 'amqplib';
export class ConnectionManager {
    config;
    channelModel = null;
    channels = new Map();
    shuttingDown = false;
    reconnectTimeout = null;
    constructor(config) {
        this.config = config;
    }
    // ─────────────────────────────────────────────
    // CONNECT
    // ─────────────────────────────────────────────
    async connect() {
        if (this.channelModel)
            return this.channelModel;
        this.channelModel = await amqp.connect(this.config.url, {
            heartbeat: this.config.heartbeat ?? 60,
        });
        // ⚠️ connection-level events live here
        this.channelModel.connection.on('error', (err) => {
            console.log({
                logType: 'error',
                message: 'RabbitMQ connection error',
                error: err.message,
            });
        });
        this.channelModel.connection.on('close', () => {
            if (!this.shuttingDown) {
                console.log({
                    logType: 'warn',
                    message: 'RabbitMQ connection closed, reconnecting...',
                });
                this.channelModel = null;
                this.channels.clear();
                this.scheduleReconnect();
            }
        });
        console.log({ logType: 'success', message: 'RabbitMQ connected' });
        return this.channelModel;
    }
    scheduleReconnect() {
        if (this.reconnectTimeout || this.shuttingDown)
            return;
        this.reconnectTimeout = setTimeout(async () => {
            this.reconnectTimeout = null;
            try {
                await this.connect();
            }
            catch (err) {
                console.log({
                    logType: 'error',
                    message: 'Reconnect failed',
                    error: String(err),
                });
                this.scheduleReconnect();
            }
        }, this.config.reconnectDelay ?? 5000);
    }
    // ─────────────────────────────────────────────
    // CHANNEL MANAGEMENT
    // ─────────────────────────────────────────────
    async getChannel(name, prefetch) {
        const existing = this.channels.get(name);
        if (existing)
            return existing;
        const model = await this.connect();
        const channel = await model.createChannel();
        await channel.prefetch(prefetch);
        channel.on('error', (err) => {
            console.log({
                logType: 'error',
                message: `Channel ${name} error`,
                error: err.message,
            });
            this.channels.delete(name);
        });
        channel.on('close', () => {
            this.channels.delete(name);
        });
        this.channels.set(name, channel);
        return channel;
    }
    // ─────────────────────────────────────────────
    // SHUTDOWN
    // ─────────────────────────────────────────────
    async shutdown() {
        this.shuttingDown = true;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        for (const [name, channel] of this.channels) {
            try {
                await channel.close();
                console.log({ logType: 'info', message: `Channel ${name} closed` });
            }
            catch {
                // ignore
            }
        }
        this.channels.clear();
        if (this.channelModel) {
            try {
                await this.channelModel.close();
                console.log({
                    logType: 'info',
                    message: 'RabbitMQ connection closed',
                });
            }
            catch {
                // ignore
            }
            this.channelModel = null;
        }
    }
}
