import path from 'node:path';
import { fileURLToPath } from 'url';
import { ARGS } from './tools/cli';

export const DIR = {
    cache: 'temp',
    tools: 'tools',
    build: 'build',
    root: path.dirname(fileURLToPath(import.meta.url)),
}

export const fromRootDir = (...paths) => path.join(DIR.root, ...paths);

export const fromOutDir = (...paths) => path.join(ARGS.outDir, ...paths);