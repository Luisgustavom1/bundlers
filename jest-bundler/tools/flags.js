import yargs from 'yargs';

const FLAGS = {
    ENTRYPOINT: 'entryPoint',
    MINIFY: 'minify',
    OUTPUT: 'output',
}

const args = yargs(process.argv).argv;

const ARGS = {
    entryPoint: args[FLAGS.ENTRYPOINT],
    output: args[FLAGS.OUTPUT],
    minify: args[FLAGS.MINIFY],
}

export { ARGS }