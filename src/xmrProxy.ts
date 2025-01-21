import { Command } from 'commander';
import * as packageJson from '../package.json';
import { ProxyOptions, getProxyOptions, startProxy } from './proxy';

const program = new Command();

program
    .name(packageJson.name)
    .version(packageJson.version)
    .description(packageJson.description)
    .option('-r, --rpc-url <RPC_URL>', 'Upstream monero RPC to interact with')
    .option('-b, --broadcast', 'Broadcast transactions to remote node')
    .option('-h, --host <HOST>', 'Proxy Host (default to 127.0.0.1)')
    .option('-p, --port <PORT>', 'Proxy Port (default to 18081, identical with monero rpc)')
    .option('--log-level <LOG_LEVEL>', 'Log level')
    .option('--log-request', 'Log incoming request from Wallet')
    .option('--tor-port <TOR_PORT>', 'Tor Proxy to connect upstream monero RPC to connect with')
    .option(
        '--proxy <PROXY>',
        'Proxy url to connect with (should either start with http://, https://, socks5:// or socks5h://',
    )
    .action((options: ProxyOptions) => {
        startProxy(getProxyOptions(options));
    });

program.parse();
