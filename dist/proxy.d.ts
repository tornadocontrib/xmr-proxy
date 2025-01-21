import { IncomingMessage } from 'http';
export interface ProxyOptions {
    rpcUrl: string;
    broadcast?: boolean;
    host: string;
    port: number;
    logLevel?: string;
    logRequest?: boolean;
    torPort?: number;
    proxy?: string;
}
export declare function getProxyOptions(options: ProxyOptions): ProxyOptions;
/**
 * We fully parse readable stream to full buffer object here
 * (Could be either binary data .bin or JSON object)
 */
export declare function concatBody(req: IncomingMessage): Promise<Buffer | undefined>;
export declare function startProxy(options: ProxyOptions): Promise<void>;
