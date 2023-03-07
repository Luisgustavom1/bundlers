import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Resolver from 'jest-resolve';
import JestHasteMap from 'jest-haste-map';
import chalk from 'chalk';
import yargs from 'yargs';

const root = join(dirname(fileURLToPath(import.meta.url)), "cmd");
 
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

const args = yargs(process.argv).argv;
const entryPoint = args.entryPoint;

if (!hasteFS.exists(entryPoint)) {
    throw new Error("Entry point file does not exist.")
}

console.log(chalk.bold(`- 🔥🔥🔥 Building ${chalk.yellowBright(entryPoint)}`));

const resolver = new Resolver.default(moduleMap, {
    extensions: ['.js'],
    hasCoreModules: false,
    rootDir: root,
}); 

const allFiles = new Set();
const modules = new Map();
const queueModules = [entryPoint];
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
    
    const codeContent = code.match(/module\.exports\s+=\s+((.|\n|\r)*);/)?.[1] || '';

    const moduleData = {
        id: id++,
        code: codeContent,
        dependencyMap,
    };

    modules.set(module, moduleData);
    queueModules.push(...dependencyMap.values());
};

console.log(chalk.bold(`- Found ${chalk.yellowBright(allFiles.size)} files`));
console.log("\nFiles:");
console.log(Array.from(allFiles).join('\n- '));

console.log("- \n Serializing bundle");

console.log(...modules);

for (const [module, moduleData] of [...modules].reverse()) {
    let { code, dependencyMap } = moduleData;

    for (const [dependencyName, dependencyPath] of dependencyMap) {
        code = code.replace(
            new RegExp(
                `require\\(('|")${dependencyName.replace(/[\.\/]/g, '\\$&')}\\1\\)`,
            ),
            modules.get(dependencyPath).code
        )
    };

    moduleData.code = code;
}

console.log(modules.get(entryPoint).code)