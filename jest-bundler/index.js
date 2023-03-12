import { hrtime } from 'node:process';
import fs from 'node:fs';
import { Worker } from 'jest-worker';
import chalk from 'chalk';
import { minify } from "terser";
import { ARGS } from './tools/cli.js';
import { generateModuleMap } from './tools/moduleMap.js';
import { generateBundle } from './tools/bundler.js';
import { DIR, fromRootDir } from './dir.js';

const start = hrtime.bigint();

console.log(chalk.bold(`- 🔥🔥🔥 Building ${chalk.yellowBright(ARGS.entryPoint)}`));
const modules = await generateModuleMap(ARGS.entryPoint);

const worker = new Worker(
    new URL(fromRootDir(DIR.TOOLS, 'worker.cjs'), import.meta.url),
    {
        enableWorkerThreads: true
    }
)

console.log(chalk.bold("\n- Serializing bundle"));
const results = await generateBundle(modules, worker.transformESMFiles);

const output = [
    fs.readFileSync(fromRootDir(DIR.TOOLS, 'runtime.js'), 'utf-8'),
    ...results,
    `requireModule(0);`
]

let codeOutput = output.join('\n');

if (ARGS.minify) {
    codeOutput = (await minify(codeOutput, { compress: true, mangle: true })).code;
} 

if (ARGS.output) {
    fs.writeFileSync(ARGS.output, codeOutput, 'utf-8');
}

worker.end();
const end = hrtime.bigint();
console.log(chalk.green(`Generate build successfully in ${end - start} nanoseconds`));