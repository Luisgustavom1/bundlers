Simple bundle with jest to bundle your js code, with some functionality as cache, source map, minify, hot reload and server.

- [Tutorial](https://cpojer.net/posts/building-a-javascript-bundler)

See [test.js](./test.js) to see code result

To bundle our code
```bash
node index.js --entryPoint example/cmd/index.js --output test.js --minify
```

Execute our code 
```bash
node test.js
```

## Todos

&#9745;  Add workers

&#9745;  Add cache

&#9745;  Add minify flags

&#9744;  Add source map

&#9744;  Implements HTTP server 

&#9744;  Add hot reload 

 

