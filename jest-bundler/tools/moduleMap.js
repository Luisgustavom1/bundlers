import { dirname } from 'node:path';
import fs from 'node:fs';
import Resolver from 'jest-resolve';
import JestHasteMap from 'jest-haste-map';
import chalk from 'chalk';

export const generateModuleMap = async (entryPointPath) => {
    const root = dirname(entryPointPath);
 
    const hasteMapOptions = {
        name: 'jest-bundler',
        rootDir: root,
        roots: [root],
        extensions: ['js'],
        platforms: [],
        maxWorkers: 1
    }
    const hasteMap = new JestHasteMap.default(hasteMapOptions);
    await hasteMap.setupCachePath(hasteMapOptions);

    const { hasteFS, moduleMap } = await hasteMap.build();
    if (!hasteFS.exists(entryPointPath)) {
        throw new Error("Entry point file does not exist.")
    }

    const resolver = new Resolver.default(moduleMap, {
        extensions: ['.js'],
        hasCoreModules: false,
        rootDir: root,
    }); 

    const allFiles = new Set();
    const modules = new Map();
    const queueModules = [entryPointPath];

    let id = 0;
    while(queueModules.length) {
        const module = queueModules.shift();

        if (allFiles.has(module)) continue;
        allFiles.add(module);

        const dependencyMap = new Map(
            hasteFS
                .getDependencies(module)
                ?.map(dependencyName => [
                    dependencyName,
                    resolver.resolveModule(module, dependencyName)
                ])
        );

        const code = fs.readFileSync(module, 'utf-8');
        
        const moduleData = {
            id: id++,
            code,
            dependencyMap,
        };

        modules.set(module, moduleData);
        queueModules.push(...dependencyMap.values());
    };

    console.log(chalk.bold(`- Found ${chalk.yellowBright(allFiles.size)} files`));
    console.log("\nFiles:");
    console.log(Array.from(allFiles).join('\n- '));

    return modules;
} 