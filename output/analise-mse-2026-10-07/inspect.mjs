import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
const source='C:/Users/Kauan/Pictures/MSE';
const out=resolve(import.meta.dirname);
async function hashes(root,dir=root){const entries=await readdir(dir,{withFileTypes:true});const rows=[];for(const entry of entries){const path=resolve(dir,entry.name);if(entry.isDirectory())rows.push(...await hashes(root,path));else rows.push({path:relative(root,path).replaceAll('\\','/'),sha256:createHash('sha256').update(await readFile(path)).digest('hex')});}return rows.sort((a,b)=>a.path.localeCompare(b.path));}
if(process.argv.includes('--hash')){await writeFile(resolve(out,process.argv.includes('--after')?'original-after.json':'original-before.json'),JSON.stringify(await hashes(source),null,2));process.exit();}
const {chromium}=await import('file:///C:/Users/Kauan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true,channel:'msedge',args:['--enable-unsafe-swiftshader']});
const errors=[],requests=[],responses=[];
await mkdir(resolve(out,'visual'),{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>requests.push({url:r.url().split('?')[0],error:r.failure()?.errorText}));
 page.on('response',r=>{if(r.url().includes('gstatic.com/firebasejs')||r.status()>=400)responses.push({url:r.url().split('?')[0],status:r.status()});});
 await page.goto('http://127.0.0.1:4173/index.html');await page.waitForLoadState('networkidle');
 const sdk=await page.evaluate(async()=>{try{const c=await MSA.firebase.ready();await c.auth.authStateReady();return {ready:true,sdk:c.authSDK.SDK_VERSION??null};}catch(e){return {ready:false,code:e.code,message:e.message};}});
 const publicConfiguration=await page.evaluate(async()=>{try{const r=await fetch('https://identitytoolkit.googleapis.com/v1/projects?key='+MSA.firebaseConfig.apiKey);const b=await r.json();return {status:r.status,error:b.error??null,authorizedDomains:b.authorizedDomains??[],passwordSignInAllowed:b.allowPasswordUser??null,projectId:b.projectId??null};}catch(e){return {error:e.message};}});
 const passwordPolicy=await page.evaluate(async()=>{try{const c=await MSA.firebase.ready();const basic=await c.authSDK.validatePassword(c.auth,'abc123');const strong=await c.authSDK.validatePassword(c.auth,'Aa9!ExampleLocalReview2026');return {basic,strong};}catch(e){return {code:e.code,message:e.message};}});
 await page.screenshot({path:resolve(out,'visual/mse-login.png'),fullPage:true});
 await page.goto('http://127.0.0.1:4173/cadastro.html');await page.waitForLoadState('networkidle');
 const roles=await page.locator('#cargo option').allTextContents();await page.screenshot({path:resolve(out,'visual/mse-cadastro.png'),fullPage:true});
 await page.goto('http://127.0.0.1:4173/planta-demo.html');await page.waitForLoadState('networkidle');
 const buttons=await page.locator('button').evaluateAll(elements=>elements.map(el=>({text:el.innerText,aria:el.getAttribute('aria-label'),action:el.dataset.plantAction,id:el.dataset.machineId})));
 await page.screenshot({path:resolve(out,'visual/mse-planta.png'),fullPage:true});
 const demo=await page.evaluate(()=>({telemetryMode:MSA.telemetry.mode,catalogCount:MSA.telemetry.catalog.length,nhpl:MSA.telemetry.get('NHPL')}));
 const report={sdk,publicConfiguration,passwordPolicy,roles,buttons,demo,errors,requests,responses,scope:'Public SDK and public Auth/password policy only; no login credentials submitted, accounts created or private data read.'};
 await writeFile(resolve(out,'inspection.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({sdk,publicConfiguration,passwordPolicy,roles,errors,requests,responses},null,2));
}finally{await browser.close();}
