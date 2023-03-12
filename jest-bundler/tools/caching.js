import path from 'node:path';
import fs from 'node:fs';
import md5 from 'crypto-js/md5.js';
import { DIR, fromRootDir } from "../dir.js";


export function readCache(moduleName) {
    try {
        const contentCached = fs.readFileSync(fromRootDir(DIR.CACHE, md5(moduleName).toString()), 'utf8');
        return contentCached;
    } catch {
        return undefined;
    }
}

export function writeCache(moduleName, content) {
    const cacheDir = fromRootDir(DIR.CACHE);

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
    }
    fs.writeFileSync(path.join(cacheDir, md5(moduleName).toString()), content, 'utf-8');
}