export const generateBundle = async (modules, transformESMFileWorker) => {
    return await Promise.all(
        Array.from(modules)
            .reverse()
            .map(async ([_, moduleData]) => {
                let { code, dependencyMap, id } = moduleData;
    
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
    
                return wrapOutputModule(id, code);
            })
    )    
}

function wrapOutputModule(id, code) {
    return `define(${id}, function(module, exports, require) {\n${code}})`; 
}
