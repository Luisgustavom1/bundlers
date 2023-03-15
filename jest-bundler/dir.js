import path from 'node:path';
import { fileURLToPath } from 'url';

export const DIR = {
    CACHE: 'temp',
    TOOLS: 'tools',
    DIST: 'dist',
    ROOT: path.dirname(fileURLToPath(import.meta.url)),
}

export const fromRootDir = (...paths) => path.join(DIR.ROOT, ...paths);