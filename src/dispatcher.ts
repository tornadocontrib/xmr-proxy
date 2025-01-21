import { socksDispatcher } from 'fetch-socks';
import { Dispatcher, ProxyAgent } from 'undici';

export type DispatcherFunc = (retry?: number) => Dispatcher;

export function getDispatcherFunc(torPort?: number, proxyUrl?: string): DispatcherFunc | undefined {
    if (!torPort && !proxyUrl) {
        return;
    }

    return (retry?: number) => {
        if (torPort) {
            return socksDispatcher({
                type: 5,
                host: '127.0.0.1',
                port: torPort,
                userId: `tor${retry || 0}`,
                password: 'x',
            }) as Dispatcher;
        }

        const { protocol, username: userId, password, host, port } = new URL(String(proxyUrl));

        if (protocol === 'socks5:' || protocol === 'socks5h:') {
            return socksDispatcher({
                type: 5,
                host,
                port: Number(port),
                userId,
                password,
            }) as Dispatcher;
        }

        if (protocol === 'http:' || protocol === 'https:') {
            return new ProxyAgent(String(proxyUrl));
        }

        throw new Error('Unsupported proxy protocol');
    };
}
