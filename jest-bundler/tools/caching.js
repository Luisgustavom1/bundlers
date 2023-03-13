import path from 'node:path';
import fs from 'node:fs';
// In v18 node version zlib still experimental
import zlib from 'node:zlib';
import md5 from 'crypto-js/md5.js';
import { DIR, fromRootDir } from "../dir.js";

export function readCache(moduleName, prefix) {
    try {
        const contentCached = fs.readFileSync(
            fromRootDir(DIR.CACHE, `${prefix}-${md5(moduleName).toString()}`), 
            'base64'
        );
        const contentUnzip = zlib.unzipSync(Buffer.from(contentCached, 'base64'));

        return contentUnzip.toString();
    } catch (error) {
        return undefined;
    }
}

export async function writeCache(moduleName, content, prefix) {
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

    const contentCompressed = zlib.gzipSync(content);

    fs.writeFile(
        path.join(cacheDir, `${prefix}-${md5(moduleName).toString()}`), 
        contentCompressed.toString('base64'), 
        'base64',
        () => {}
    );
}