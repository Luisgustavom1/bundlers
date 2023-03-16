import { readCache, writeCache } from "./caching.js";

export const generateBundle = async (modules, transformESMFileWorker) => {
    return await Promise.all(
        Array.from(modules)
            .reverse()
            .map(async ([modulePath, moduleData]) => {
                let { code, dependencyMap, id } = moduleData;
                const originalCode = code;

                const moduleCached = await readCache(originalCode, id);
                if (moduleCached) {
                    return makeBundlerReturn(modulePath, moduleCached);
                }
                
                ({ code } = await transformESMFileWorker(code));
    
                for (const [dependencyName, dependencyPath] of dependencyMap) {
                    const dependency = modules.get(dependencyPath);
                    code = code.replace(
                        new RegExp(
                            `require\\(('|")${dependencyName.replace(/[\.\/]/g, '\\$&')}\\1\\)`,
                        ),
                        `require(${dependency.id})`
                    )
                };
                
                const outputModule = wrapOutputModule(id, code);
                writeCache(originalCode, outputModule, id);

                return makeBundlerReturn(modulePath, outputModule);
            })
    )    
}

function makeBundlerReturn(path, code) {
    return {
        path: path,
        code: code,
    }
}

function wrapOutputModule(id, code) {
    return `define(${id}, function(module, exports, require) {\n${code}})`; 
}