import { bundle } from "./compiler";

bundle("./example/index.js").then(code => {
    console.log(code, '\n');

    eval(code);
})