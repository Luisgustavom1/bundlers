import { createGraph } from "./compiler/graph";

createGraph("./example/index.ts").then(console.log)