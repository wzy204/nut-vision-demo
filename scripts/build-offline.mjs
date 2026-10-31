import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';

// All geometry, textures and UI are procedural; bundle everything for file:// use.
const result=await build({entryPoints:['src/main.js'],bundle:true,format:'iife',minify:true,write:false,outfile:'app.js',legalComments:'none'});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text;
const css=result.outputFiles.find(f=>f.path.endsWith('.css')).text;
let html=await readFile('index.html','utf8');
html=html.replace('</head>',`<style>${css}</style></head>`).replace('<script type="module" src="./src/main.js"></script>',()=>`<script>${js.replace(/<\/script/gi,'<\\/script')}</script>`);
await writeFile('dist/NUT-VISION-离线演示.html',html);
console.log('Offline single file: dist/NUT-VISION-离线演示.html');
