const modules = new Map();
const moduleCache = new Map();

const define = (name, moduleFactory) => {
    modules.set(name, moduleFactory);
}

const requireModule = (name) => {
    if (moduleCache.has(name)) {
        return modules.get(name).exports;
    }

    if (!modules.has(name)) {
        throw new Error(`Module ${name} does not exists`);
    }

    const moduleFactory = modules.get(name);

    const module = {
        exports: {},
    };

    moduleCache.set(name, module);

    moduleFactory(module, module.exports, requireModule);
    
    return module.exports;
}