import chalk from 'chalk';
import JestHasteMap from 'jest-haste-map';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import Resolver from 'jest-resolve';
import { DependencyResolver } from 'jest-resolve-dependencies';

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
const dependencyResolver = new DependencyResolver(resolver, hasteFS);

const allFiles = new Set();
const queueDependencies = [entryPoint];

while(queueDependencies.length) {
    const dependencies = queueDependencies.shift();

    if (allFiles.has(dependencies)) continue;

    allFiles.add(dependencies);
    queueDependencies.push(...dependencyResolver.resolve(dependencies));
};

console.log(chalk.bold(`- Found ${chalk.yellowBright(allFiles.size)} files`));
console.log("\nFiles:")
allFiles.forEach(f => console.log(`- ${f}`));