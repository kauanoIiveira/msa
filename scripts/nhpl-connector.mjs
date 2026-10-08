import {createServer} from 'node:http';
import {readdir,stat,readFile,realpath} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function startConnector({directory,port=5188,origin='http://127.0.0.1:5175',pollMs=1000}={}) {
 if(!directory)throw new Error('Informe --directory para uma pasta autorizada, somente de eventos NHPL.');
 const root=await realpath(resolve(directory)),seen=new Map(),stable=new Map(),events=new Map(),errors=new Map();
 let busy=false,closed=false;
 async function scan(){if(busy||closed)return;busy=true;
  try{for(const entry of await readdir(root,{withFileTypes:true})){
   if(!entry.isFile()||!entry.name.endsWith('.json'))continue;
   const file=await realpath(resolve(root,entry.name)),rel=relative(root,file);if(rel.startsWith('..')||rel.includes('\0'))continue;
   const info=await stat(file);if(info.size>1_000_000){errors.set(entry.name,'Arquivo maior que 1 MB');continue;}
   const signature=info.size+':'+info.mtimeMs;if(seen.get(entry.name)===signature)continue;
   if(stable.get(entry.name)!==signature){stable.set(entry.name,signature);continue;}
   try{
    const data=JSON.parse(await readFile(file,'utf8')),rows=Array.isArray(data)?data:[data];
    if(rows.length>500||rows.some(r=>r.schemaVersion!==1||!r.eventId||!r.sourceId||!Number.isSafeInteger(r.sequence)))throw new Error('Formato de evento inválido');
    const next=new Map(events);for(const row of rows){const id=row.sourceId+'|'+row.eventId,old=next.get(id);if(old&&JSON.stringify(old)!==JSON.stringify(row))throw new Error('Identificador com conteúdo conflitante');next.set(id,row);}
    if(next.size>500)throw new Error('Fila excede 500 eventos; iniciar nova sessão/pasta de captura');
    events.clear();for(const[k,v]of next)events.set(k,v);seen.set(entry.name,signature);errors.delete(entry.name);
   }catch(error){errors.set(entry.name,error.message);}
  }}catch(error){errors.set('directory',error.message);}finally{busy=false;}
 }
 const server=createServer((req,res)=>{
  const allowed=!req.headers.origin||req.headers.origin===origin;
  if(!allowed||req.headers.host!==`127.0.0.1:${server.address().port}`&&req.headers.host!==`localhost:${server.address().port}`){res.writeHead(403).end();return;}
  const headers={'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if(req.method==='OPTIONS'){res.writeHead(204,{...headers,'Access-Control-Allow-Methods':'GET','Access-Control-Allow-Private-Network':'true'}).end();return;}
  if(req.method!=='GET'||!['/events','/status'].includes(req.url)){res.writeHead(404,headers).end();return;}
  res.writeHead(200,headers).end(JSON.stringify({events:req.url==='/events'?[...events.values()].sort((a,b)=>a.occurredAt-b.occurredAt||a.sequence-b.sequence):undefined,queued:events.size,errors:[...errors].map(([file,message])=>({file,message})),source:'local-files'}));
 });
 await new Promise((ok,no)=>{server.once('error',no);server.listen(port,'127.0.0.1',ok);});
 const timer=setInterval(scan,pollMs);await scan();
 return {server,scan,close:()=>{closed=true;clearInterval(timer);return new Promise(ok=>server.close(ok));}};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const arg=name=>process.argv[process.argv.indexOf(name)+1],directory=process.argv.includes('--directory')?arg('--directory'):null;
 const connector=await startConnector({directory,port:process.argv.includes('--port')?Number(arg('--port')):5188,origin:process.argv.includes('--origin')?arg('--origin'):undefined});
 console.log('Conector loopback: http://127.0.0.1:'+connector.server.address().port+' · pasta autorizada: '+resolve(directory));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>connector.close().then(()=>process.exit(0)));
}
