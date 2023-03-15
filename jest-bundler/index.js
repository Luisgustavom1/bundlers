import { hrtime } from 'node:process';
import fs from 'node:fs';
import { Worker } from 'jest-worker';
import chalk from 'chalk';
import { minify } from "terser";
import { ARGS } from './tools/cli.js';
import { generateModuleMap } from './tools/moduleMap.js';
import { generateBundle } from './tools/bundler.js';
import { DIR, fromRootDir } from './dir.js';
import path from 'node:path';

(async () => {
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

    const codeOutput = {
        code: output.join('\n'),
        map: undefined
    };

    if (ARGS.minify) {
        const minifiedCode = await minify(codeOutput.code, { sourceMap: true });

        codeOutput.code = minifiedCode.code;
        codeOutput.map = minifiedCode.map;
    } 

    if (ARGS.output) {
        fs.writeFileSync(path.join('dist', ARGS.output), codeOutput.code, 'utf-8');

        if (!codeOutput.map) return;

        fs.writeFileSync(`${path.join('dist', ARGS.output)}.map`, codeOutput.map, 'utf-8');
    }

    worker.end();
    const end = hrtime.bigint();
    console.log(chalk.green(`Generate build successfully in ${end - start} nanoseconds`));
})()