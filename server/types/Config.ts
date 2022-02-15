export interface Config {
    port?: string;
    sessionSecret?: string;
    sessionSecureCookies: boolean;
    connectionString?: string;
    clientUrl?: string;
    smtp: {
        enabled: boolean;
        host?: string;
        port?: string;
        from?: string;
    }
};
