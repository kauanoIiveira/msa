import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
export function createStaticServer({port=5173,base='/',testHarness=false}={}) {
  const root=resolve('app');
  const server=createServer(async(req,res)=>{
    try {
      const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(!path.startsWith(base)||path.includes('\0')||path.includes('\\')) {res.writeHead(404).end();return;}
      const local=path.slice(base.length);
      const harness=testHarness&&local==='__test__/harness.html';
      const file=harness?resolve('tests/browser/harness.html'):resolve(root,local||'index.html');
      const rel=relative(root,file);
      if(!harness&&(rel.startsWith('..')||!rel)) {res.writeHead(403).end();return;}
      if(!(await stat(file)).isFile()) {res.writeHead(404).end();return;}
      const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png'};
      res.writeHead(200,{'Content-Type':`${types[extname(file)]??'text/plain'}; charset=utf-8`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(await readFile(file));
    } catch {res.writeHead(404).end();}
  });
  return new Promise((resolveServer,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>resolveServer(server));});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const port=Number(process.env.PORT??5173),base=process.env.BASE_PATH??'/';
  const server=await createStaticServer({port,base,testHarness:process.argv.includes('--test-harness')});console.log(`http://127.0.0.1:${server.address().port}${base}`);
}
