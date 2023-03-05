import chalk from 'chalk';
import JestHasteMap from 'jest-haste-map';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';

const root = join(dirname(fileURLToPath(import.meta.url)), "libs");
 
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

console.log(chalk.bold(`- 🔥🔥🔥 Building ${chalk.yellowBright(entryPoint)}`))

