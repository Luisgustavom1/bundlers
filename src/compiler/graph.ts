import * as fs from "node:fs";
import * as util from "node:util"
import * as path from "node:path";
import * as swc from "@swc/core";

const readFile = util.promisify(fs.readFile);

export const createGraph = async (entry: string) => {
    let ID = 0;

    type Module = {
        id: number;
        code: string;
        dependencies: Map<string, number>;
    }

    const modules: Module[] = [];

    const createModule = async (filename: string) => {
        const id = ID++;

        const absoluteFile = 
            path.join(process.cwd(), filename) + 
            (path.extname(filename) === "" ? ".ts" : "");
        
        const content = await readFile(absoluteFile, "utf8");

        const ast = await swc.parse(content, { syntax: "ecmascript" });

        const imports =
            ast.body.filter((node): node is Extract<typeof node, { type: "ImportDeclaration" }> => 
                node.type === "ImportDeclaration"
            );

        const dependencies = new Map<string, number>()
        for (const node of imports) {
            const mod = await createModule(
                path.join(path.dirname(filename), node.source.value)
            );
            dependencies.set(node.source.value, mod.id);
        };

        const { code } = await swc.transform(content, {
            filename,
            module: { type: "commonjs" }
        })

        const mod: Module = { id, code, dependencies };
        modules.push(mod);
        return mod;
    }

    await createModule(entry);

    return modules;
}
