import yargs from 'yargs';

const FLAGS = {
    entryPoint: 'entryPoint',
    minify: 'minify',
    outFile: 'outFile',
}

const args = yargs(process.argv)
    .default('outFile', 'index.js')
    .default('outDir', '.')
    .argv;

const ARGS = {
    entryPoint: args[FLAGS.entryPoint],
    outFile: args[FLAGS.outFile],
    minify: args[FLAGS.minify],
}

export { ARGS }