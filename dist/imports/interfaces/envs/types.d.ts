export interface DatabaseEnv {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
}
