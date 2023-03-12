import path from 'node:path';
import fs from 'node:fs';
import md5 from 'crypto-js/md5.js';
import { DIR, fromRootDir } from "../dir.js";


export function readCache(moduleName, prefix) {
    try {
        const contentCached = fs.readFileSync(fromRootDir(DIR.CACHE, `${prefix}-${md5(moduleName).toString()}`), 'utf8');
        return contentCached;
    } catch {
        return undefined;
    }
}

export function writeCache(moduleName, content, prefix) {
    const cacheDir = fromRootDir(DIR.CACHE);

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
    }

    const files = fs.readdirSync(cacheDir);
    for (const file of files) {
        const filePrefix = file.split('-')[0];
        
        if (filePrefix === String(prefix)) {
            fs.rmSync(path.join(cacheDir, file))
        }
    }

    fs.writeFileSync(path.join(cacheDir, `${prefix}-${md5(moduleName).toString()}`), content, 'utf-8');
}