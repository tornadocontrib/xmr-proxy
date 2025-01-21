const path = require('path');
const { BannerPlugin } = require('webpack');
const { name, version, description } = require('./package.json');

const banner = `#!/usr/bin/env node
/**
 * ${name} ${version}
 * 
 * ${description}
 */
`

const esbuildLoader = {
    test: /\.ts?$/,
    loader: 'esbuild-loader',
    options: {
        loader: 'ts',
        target: 'es2022',
    }
}

module.exports = [
    {
        mode: 'production',
        module: {
            rules: [esbuildLoader]
        },
        entry: './src/xmrProxy.ts',
        output: {
            filename: 'xmrProxy.js',
            path: path.resolve(__dirname, './dist'),
        },
        target: 'node',
        plugins: [
            new BannerPlugin({
                banner,
                raw: true
            })
        ],
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        optimization: {
            minimize: false,
        }
    }
];
