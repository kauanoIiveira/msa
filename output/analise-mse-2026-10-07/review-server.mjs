import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,relative,isAbsolute,sep,extname} from 'node:path';
import vm from 'node:vm';
const root='C:/Users/Kauan/Pictures/MSE/dist';
const fixture=await readFile('C:/Users/Kauan/Pictures/MSE/scripts/test-plant-browser.mjs','utf8');
const replacements=vm.runInNewContext('('+fixture.match(/const replacements=({[\s\S]*?});\r?\nconst server=/)[1]+')');
createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(Object.hasOwn(replacements,pathname)){res.setHeader('Content-Type','application/javascript');res.end(replacements[pathname]);return;}const path=resolve(root,'.'+(pathname==='/'?'/sistema.html':pathname));const rel=relative(root,path);if(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel))throw Error('path');let content=await readFile(path);const type=extname(path);if(type==='.html')content=content.toString().replace('</body>','<aside aria-label="Fonte dos dados" style="position:fixed;bottom:0;right:0;z-index:10000;background:white;color:#111;padding:4px;border:1px solid #888;font:12px sans-serif">ANALISE LOCAL · FIXTURES · SEM FIREBASE</aside></body>');res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf'})[type]??'application/octet-stream');res.end(content);}catch{res.statusCode=404;res.end();}}).listen(4174,'127.0.0.1',()=>console.log('Fixture review only: http://127.0.0.1:4174/sistema.html?qa=chefe'));
