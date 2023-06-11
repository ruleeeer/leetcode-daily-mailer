// import {build} from "esbuild";
const esbuild = require('esbuild')
esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/index.js',
    platform: 'node',
    target: 'node18',
    bundle: true,
    format:"esm",
    // minify:true
}).catch(() => process.exit(1));