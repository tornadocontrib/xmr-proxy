/**
 * Update nodes from Node.js instead of Browser cause it doesn't provide CORS header :(
 */

import { writeFile } from 'fs/promises';

interface MoneroFailResp {
    monero?: {
        web_compatible?: string[];
    };
}

async function update() {
    const nodesJson = (await (await fetch('https://monero.fail/nodes.json')).json()) as MoneroFailResp;

    const web_compatible = nodesJson?.monero?.web_compatible;

    const nodes = [...(web_compatible || [])].sort((a, b) => (a === b ? 0 : b.includes('.onion') ? -1 : 1));

    const nodesStr = `const nodes = ${JSON.stringify(nodes, null, 2)};`;

    await writeFile('static/nodes.js', nodesStr);

    console.log(`Wrote ${nodes.length} nodes to static/nodes.js`);
}

update();
