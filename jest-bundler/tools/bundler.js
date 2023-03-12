import { readCache, writeCache } from "./caching.js";

export const generateBundle = async (modules, transformESMFileWorker) => {
    return await Promise.all(
        Array.from(modules)
            .reverse()
            .map(async ([_, moduleData]) => {
                let { code, dependencyMap, id } = moduleData;
                const originalCode = code;

                const moduleCached = readCache(originalCode, id);
                if (moduleCached) {
                    return moduleCached;
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

                return outputModule;
            })
    )    
}

function wrapOutputModule(id, code) {
    return `define(${id}, function(module, exports, require) {\n${code}})`; 
}