import type { ChannelModel, Channel } from 'amqplib';
export interface ConnectionManagerConfig {
    url: string;
    heartbeat?: number;
    reconnectDelay?: number;
}
export declare class ConnectionManager {
    private readonly config;
    private channelModel;
    private channels;
    private shuttingDown;
    private reconnectTimeout;
    constructor(config: ConnectionManagerConfig);
    connect(): Promise<ChannelModel>;
    private scheduleReconnect;
    getChannel(name: string, prefetch: number): Promise<Channel>;
    shutdown(): Promise<void>;
}
