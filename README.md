# XMR Proxy

Reverse proxy to make Monero public nodes private again

## About

It is known that hostile US Agencies or US funded companies like Chainalysis are trying to track Monero transactions and decoy outputs to guess possible outputs of the spent coins.

While using Monero by remote nodes is private by design ( it doesn't request to load balance of the addresses in particular, but it attempts to scan the latest blocks and find the received coins locally ), the only RPC method that would enable some small window of tracking would be [/send_raw_transaction](https://www.getmonero.org/resources/developer-guides/daemon-rpc.html#send_raw_transaction) , which broadcasts signed encoded transaction to P2P network and thus makes transaction being mined by miners.

While it is possible to use Tor connections on Monero Wallet in order to connect remote nodes it gives several limitations especially when the network connection with Tor is slower or have significant latency. Also, it is not possible to select random nodes to broadcast transactions like how [Dandelion++](https://web.getmonero.org/2020/04/18/dandelion-implemented.html) on Monero mempool works.

Therefore, this repository shall provide one Node.js proxy script and one tx broadcasting UI to public nodes listed on [monero.fail](https://monero.fail) which is a directory of list of Public RPC endpoints.

## Usage

### `yarn start --rpc-url <RPC_URL>`

Will start Reverse Proxy CLI to route any requests except the broadcast method. (You can also add `--broadcast` to reenable broadcasting transactions to remote node like any other RPCs).

You can check console for the signed raw transaction sent by local Monero wallet (connected with remote node option `localhost:18081`), and paste those to explorers like xmrchain.net or the `broadcast.html` UI to broadcast on UI without trails.

### `broadcast.html`

( for review https://tornadocontrib.github.io/xmr-proxy/broadcast.html, do not use online version in production )

Simple UI to broadcast signed transactions, like https://xmrchain.net/rawtx but it can broadcast to any Monero RPC nodes listed on https://monero.fail or node provided with custom input.