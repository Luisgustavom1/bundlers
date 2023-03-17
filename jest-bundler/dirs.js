import path from 'node:path';
import { fileURLToPath } from 'url';

export const DIR = {
    cache: 'temp',
    tools: 'tools',
    dist: 'dist',
    root: path.dirname(fileURLToPath(import.meta.url)),
}

export const fromRootDir = (...paths) => path.join(DIR.root, ...paths);