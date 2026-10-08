// Local QA only: no Firebase requests, passwords, account creation or role changes.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
const root=resolve('app');
const fixture=`
import {createLocalRepository} from './ui/demo-workspace.js';
import {createMsaServices} from './services/create-msa.js';
import {loginAccounts} from './config/login-accounts.js';
if(location.search.includes('qa-faults')){
 let failNext=false;const write=Storage.prototype.setItem;
 Storage.prototype.setItem=function(key,value){if(failNext&&key==='msa.nhpl.live.v1'){failNext=false;throw new Error('QA: quota simulada');}return write.call(this,key,value);};
 const button=document.createElement('button');button.textContent='QA: falhar próxima gravação';button.style.cssText='position:fixed;right:10px;bottom:10px;z-index:1000';button.onclick=()=>{failNext=true;};document.body.append(button);
}

export function createBrowserMsa(){
 let user=JSON.parse(sessionStorage.getItem('qa-nhpl-user')??'null'),actor;
 const observers=new Set(),auth=new Set(),local=createLocalRepository({data:{}});
 const roles={'00000':'admin','00001':'engineer','00002':'operator','00003':'viewer'};
 const notify=()=>{for(const cb of observers)cb({user,actor});};
 return {auth:{watchSession(cb){auth.add(cb);queueMicrotask(()=>cb(user));return()=>auth.delete(cb);},
 async signIn(re,password){if(!roles[re]||password!=='fixture-only')throw new Error('auth/invalid-credential');user={uid:'qa-'+re,email:loginAccounts[re],displayName:'QA '+re};sessionStorage.setItem('qa-nhpl-user',JSON.stringify(user));for(const cb of auth)cb(user);return {user};},
 async signOut(){user=null;actor=null;sessionStorage.removeItem('qa-nhpl-user');notify();for(const cb of auth)cb(null);},
 async updateDisplayName(name){user.displayName=name;},async changePassword(){throw new Error('QA: senha real nunca alterada');}},
 session:{watchSession(cb){observers.add(cb);cb({user,actor});return()=>observers.delete(cb);},async onWorkspace(){const re=Object.keys(loginAccounts).find(re=>loginAccounts[re]===user.email);actor={uid:user.uid,role:roles[re]};notify();return createMsaServices({repo:local.repo,actor});}},repository(){return local.repo;}};
}`;
const server=createServer(async(req,res)=>{
 try{const path=new URL(req.url,'http://127.0.0.1').pathname;if(path==='/src/browser.js'){res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'}).end(fixture);return;}
 const file=resolve(root,'.'+decodeURIComponent(path==='/'?'/index.html':path));if(relative(root,file).startsWith('..')){res.writeHead(403).end();return;}
 const type={'.js':'text/javascript','.mjs':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json'}[extname(file)]??'application/octet-stream';
 const bytes=await readFile(file);res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(bytes);}catch{if(!res.headersSent)res.writeHead(404);res.end();}
});
const port=Number(process.env.QA_PORT??5180);server.listen(port,'127.0.0.1',()=>console.log('QA NHPL isolado: http://127.0.0.1:'+port+'/ · senha fictícia fixture-only'));
