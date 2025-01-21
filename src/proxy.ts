import process from 'process';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { getLogger } from './logger';
import { getDispatcherFunc } from './dispatcher';

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

export function getProxyOptions(options: ProxyOptions) {
    options = {
        rpcUrl: String(options.rpcUrl) || process.env.RPC_URL || '',
        broadcast: Boolean(options.broadcast) || process.env.BROADCAST === 'true',
        host: options.host || process.env.HOST || '127.0.0.1',
        port: Number(options.port || process.env.PORT || 18081),
        logLevel: process.env.LOG_LEVEL || undefined,
        logRequest: Boolean(options.logRequest) || process.env.LOG_REQUEST === 'true',
        torPort: Number(options.torPort || process.env.TOR_PORT) || undefined,
        proxy: options.proxy || process.env.PROXY || undefined,
    };

    return options;
}

/**
 * We fully parse readable stream to full buffer object here
 * (Could be either binary data .bin or JSON object)
 */
export function concatBody(req: IncomingMessage): Promise<Buffer | undefined> {
    return new Promise((resolve, reject) => {
        const body: Buffer[] = [];

        req.on('data', (chunk) => {
            body.push(chunk);
        })
            .on('end', () => {
                resolve(body.length ? Buffer.concat(body) : undefined);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

export async function startProxy(options: ProxyOptions) {
    const logger = getLogger('[MoneroProxy]', options.logLevel);

    if (!options.rpcUrl) {
        logger.error('Valid upstream monero RPC URL required');
        process.exit(1);
    }

    const handleRequests = async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
        try {
            const startTime = Date.now();
            const body = await concatBody(req);
            const isJson = body && req.headers['content-type']?.includes('application/json');
            const isTxSubmit = req.url?.includes('send_raw_transaction') || req.url?.includes('sendrawtransaction');
            const parsedJson = isJson ? JSON.parse(body.toString()) : undefined;
            // Parse rpc method (parse according to monero rpc specification)
            const rpcMethod: string = parsedJson?.method || req.url;

            if (options.logRequest) {
                console.log('WalletRequest', {
                    url: req.url,
                    method: req.method,
                    headers: req.headers,
                    rpcMethod,
                    body: parsedJson || body,
                });
            }

            // Show raw tx on log and do not send to remote node for enhanced privacy
            if (isTxSubmit && !options.broadcast) {
                console.log(Boolean(isTxSubmit && !options.broadcast)); // temporarial hack to log tx

                logger.info('Received raw tx however not sending, make sure to send those on xmrchain.net');

                console.log(JSON.stringify(parsedJson, null, 2));

                res.writeHead(200, {
                    'content-type': 'application/json',
                    'access-control-allow-origin': '*',
                });
                res.write(JSON.stringify({ error: 'Broadcast not allowed by RPC proxy' }));
                res.end();
                return;
            }

            const dispatcher = getDispatcherFunc(options.torPort, options.proxy)?.();

            const resp = await fetch(`${options.rpcUrl}${req.url || ''}`, {
                method: req.method,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                headers: req.headers as any,
                body,
                dispatcher,
            });

            const respHeaders: Record<string, string> = {};

            for (const key of resp.headers.keys()) {
                respHeaders[key] = resp.headers.get(key) as string;
            }

            if (!respHeaders['access-control-allow-headers']) {
                respHeaders['access-control-allow-headers'] = '*';
            }

            const respBuffer = Buffer.from(await resp.arrayBuffer());

            res.writeHead(resp.status, respHeaders);
            res.write(respBuffer);
            res.end();

            logger.info(
                `${req.method}:${resp.status}:${rpcMethod}:${body?.length || 0}:${respBuffer.byteLength}:${Date.now() - startTime}ms`,
            );
        } catch (err) {
            logger.error(`Request to ${req.url} failed, likely connection error`);
            console.log(err);

            res.writeHead(502, {});
            res.write(JSON.stringify({ error: 'Upstream error' }));
            res.end();
        }
    };

    const server = createServer((req, res) => {
        handleRequests(req, res);
    });

    server.listen(options.port, options.host);

    logger.info(
        `Monero RPC Reverse Proxy listening on http://${options.host}:${options.port} (Connected to upstream ${options.rpcUrl})`,
    );
}
