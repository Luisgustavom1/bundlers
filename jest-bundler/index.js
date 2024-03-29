import { hrtime } from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Worker } from 'jest-worker';
import chalk from 'chalk';
import { minify } from "terser";
import { ARGS } from './tools/cli.js';
import { convertOutputArrayToObj } from './share/object.js';
import { generateModuleMap } from './tools/moduleMap.js';
import { generateBundle } from './tools/bundler.js';
import { DIR, fromOutDir, fromRootDir } from './dirs.js';
import { existsSync } from 'node:fs';

(async () => {
    const start = hrtime.bigint();

    console.log(chalk.bold(`- 🔥🔥🔥 Building ${chalk.yellowBright(ARGS.entryPoint)}`));
    const modules = await generateModuleMap(ARGS.entryPoint);

    const worker = new Worker(
        new URL(fromRootDir(DIR.tools, 'worker.cjs'), import.meta.url),
        {
            enableWorkerThreads: true
        }
    )

    console.log(chalk.bold("\n- Serializing bundle"));
    const results = await generateBundle(modules, worker.transformESMFiles);

    const runtimeCode = await fs.readFile(fromRootDir(DIR.tools, 'runtime.js'), 'utf-8');
    const output = [
        {
            path: 'runtime.js',
            code: runtimeCode,
        },
        ...results,
        {
            path: 'entrypoint.js',
            code: `requireModule(0);`,
        }
    ]

    const codeOutput = {
        code: convertOutputArrayToObj(output),
        map: undefined
    };

    if (!existsSync(fromOutDir(DIR.build))) {
        await fs.mkdir(fromOutDir(DIR.build));
    }

    if (ARGS.minify) {
        const minifiedCode = await minify(
            codeOutput.code, { 
                sourceMap: {
                    filename: ARGS.outFile,
                    url: ARGS.outFile + '.map'
                } 
            });

        codeOutput.code = minifiedCode.code;
        codeOutput.map = minifiedCode.map;

        await fs.writeFile(`${fromOutDir(DIR.build, ARGS.outFile)}.map`, codeOutput.map, 'utf-8');
    } 
    
    await fs.writeFile(fromOutDir(DIR.build, ARGS.outFile), codeOutput.code, 'utf-8');

    worker.end();
    const end = hrtime.bigint();
    console.log(chalk.green(`Generate build successfully in ${end - start} nanoseconds`));
})()