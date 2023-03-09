import { dirname, join } from 'node:path';
import { hrtime } from 'node:process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { Worker } from 'jest-worker';
import Resolver from 'jest-resolve';
import JestHasteMap from 'jest-haste-map';
import chalk from 'chalk';
import { minify } from "terser";
import { ARGS } from './tools/cli.js';

const start = hrtime.bigint();
const root = join(dirname(fileURLToPath(import.meta.url)), "example");
 
const hasteMapOptions = {
    name: 'jest-bundler',
    rootDir: root,
    roots: [root],
    extensions: ['js'],
    platforms: [],
    maxWorkers: 1
}
const hasteMap = new JestHasteMap.default(hasteMapOptions);
await hasteMap.setupCachePath(hasteMapOptions);

const { hasteFS, moduleMap } = await hasteMap.build();

if (!hasteFS.exists(ARGS.entryPoint)) {
    throw new Error("Entry point file does not exist.")
}

console.log(chalk.bold(`- 🔥🔥🔥 Building ${chalk.yellowBright(ARGS.entryPoint)}`));

const resolver = new Resolver.default(moduleMap, {
    extensions: ['.js'],
    hasCoreModules: false,
    rootDir: root,
}); 

const allFiles = new Set();
const modules = new Map();
const queueModules = [ARGS.entryPoint];
let id = 0;

while(queueModules.length) {
    const module = queueModules.shift();

    if (allFiles.has(module)) continue;
    allFiles.add(module);

    const dependencyMap = new Map(
        hasteFS
            .getDependencies(module)
            ?.map(dependencyName => [
                dependencyName,
                resolver.resolveModule(module, dependencyName)
            ])
    );

    const code = fs.readFileSync(module, 'utf-8');
    
    // const codeContent = code.match(/module\.exports\s+=\s+((.|\n|\r)*);/)?.[1] || '';

    const moduleData = {
        id: id++,
        code,
        dependencyMap,
    };

    modules.set(module, moduleData);
    queueModules.push(...dependencyMap.values());
};

console.log(chalk.bold(`- Found ${chalk.yellowBright(allFiles.size)} files`));
console.log("\nFiles:");
console.log(Array.from(allFiles).join('\n- '));

console.log(chalk.bold("\n- Serializing bundle"));
const wrapOutputModule = (id, code) => `define(${id}, function(module, exports, require) {\n${code}})`; 

const worker = new Worker(
    new URL('./tools/worker.cjs', import.meta.url),
    {
        enableWorkerThreads: true
    }
)

const results = await Promise.all(
    Array.from(modules)
        .reverse()
        .map(async ([_, moduleData]) => {
            let { code, dependencyMap, id } = moduleData;

            ({ code } = await worker.transformFile(code));

            for (const [dependencyName, dependencyPath] of dependencyMap) {
                const dependency = modules.get(dependencyPath);
                code = code.replace(
                    new RegExp(
                        `require\\(('|")${dependencyName.replace(/[\.\/]/g, '\\$&')}\\1\\)`,
                    ),
                    `require(${dependency.id})`
                )
            };

            return wrapOutputModule(id, code);
        })
)

const output = [
    fs.readFileSync('./tools/runtime.js', 'utf-8'),
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