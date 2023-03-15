import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
// In v18 node version zlib still experimental
import zlib from 'node:zlib';
import md5 from 'crypto-js/md5.js';
import { DIR, fromRootDir } from "../dir.js";
import { promisify } from 'node:util';

const unzip = promisify(zlib.unzip)
const gzip = promisify(zlib.gzip)

export async function readCache(moduleName, prefix) {
    try {
        const contentCached = await fs.readFile(
            fromRootDir(DIR.CACHE, `${prefix}-${md5(moduleName).toString()}`), 
            'base64'
        );
        const contentUnzip = (await unzip(Buffer.from(contentCached, 'base64'))).toString();

        return contentUnzip;
    } catch (error) {
        return undefined;
    }
}

export async function writeCache(moduleName, content, prefix) {
    const cacheDir = fromRootDir(DIR.CACHE);

    if (!existsSync(cacheDir)) {
        await fs.mkdir(cacheDir);
    }

    const files = await fs.readdir(cacheDir);
    for (const file of files) {
        const filePrefix = file.split('-')[0];
        
        if (filePrefix === String(prefix)) {
            await fs.rm(path.join(cacheDir, file))
        }
    }

    const contentCompressed = await gzip(content);

    fs.writeFile(
        path.join(cacheDir, `${prefix}-${md5(moduleName).toString()}`), 
        contentCompressed.toString('base64'), 
        'base64',
    );
}