// Read-only audit. Credentials are supplied only in the process environment.
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import Papa from 'papaparse';
import {firebaseConfig as config} from '../../app/src/config/firebase.js';
import {createLocalRepository} from '../../app/src/ui/demo-workspace.js';
import {createMsaServices} from '../../app/src/services/create-msa.js';
import {buildHourly} from '../../app/src/domain/hourly.js';
const roots=['machines','processes','products','parameters','parameterVersions','reasons','targets','collections','production','losses','stoppages','reviews','corrections'];
if(!process.env.MSA_AUDIT_PASSWORD)throw Error('MSA_AUDIT_PASSWORD required; never store it in this file');
const authResponse=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'adm@adm.com',password:process.env.MSA_AUDIT_PASSWORD,returnSecureToken:true})});
if(!authResponse.ok)throw Error('Audit authentication failed');
const auth=await authResponse.json();
const read=async root=>{
 const response=await fetch(`${config.databaseURL}/workspaces/msa/${root}.json?auth=${auth.idToken}`);
 if(!response.ok)throw Error(`Read failed: ${root} (${response.status})`);
 return await response.json()??{};
};
const member=await read(`members/${auth.localId}`);if(member.role!=='admin')throw Error('Expected authorized administrator');
const data=Object.fromEntries(await Promise.all(roots.map(async root=>[root,await read(root)])));
const rows=root=>Object.values(data[root]),issues=[];
const check=(condition,message)=>{if(!condition)issues.push(message);};
for(const process of rows('processes'))check(data.machines[process.machineId],`process-machine:${process.id}`);
for(const product of rows('products'))for(const pid of Object.keys(product.processIds??{}))check(data.processes[pid],`product-process:${product.id}/${pid}`);
for(const parameter of rows('parameters'))check(data.processes[parameter.processId],`parameter-process:${parameter.id}`);
for(const version of rows('parameterVersions'))check(data.parameters[version.parameterId],`version-parameter:${version.id}`);
for(const root of ['collections','production','losses','stoppages','targets'])for(const record of rows(root)){
 const c=record.context??{};
 check(data.machines[c.machineId]&&data.processes[c.processId]?.machineId===c.machineId&&data.products[c.productId]?.processIds?.[c.processId]===true,`context:${root}/${record.id}`);
 if(root==='collections')for(const r of Object.values(record.readings??{}))check(data.parameters[r.parameterId]?.processId===c.processId&&data.parameterVersions[r.versionId]?.parameterId===r.parameterId,`reading-reference:${record.id}/${r.parameterId}`);
}
for(const r of rows('reviews'))check(data.collections[r.collectionId],`review-original:${r.id}`);
for(const r of rows('corrections'))check(data[r.recordType]?.[r.recordId],`correction-original:${r.id}`);
const local=createLocalRepository({data,now:Date.now}),s=createMsaServices({repo:local.repo,actor:{uid:auth.localId,role:member.role},papa:Papa});
const dates=rows('collections').map(r=>r.eventDate).sort(),windows=[['initial','2026-10-01','2026-10-07']];
if(dates.length)windows.push(['available',dates[0],dates.at(-1)]);
for(const target of rows('targets'))if(!windows.some(([,from,to])=>from===target.fromDate&&to===target.toDate))windows.push(['target-window',target.fromDate,target.toDate]);
const queries=[];
for(const product of rows('products'))for(const processId of Object.keys(product.processIds??{}))for(const [window,fromDate,toDate] of windows)for(const dataset of ['operational','presentation']){
 const context={machineId:data.processes[processId].machineId,processId,productId:product.id};
 const query={context,fromDate,toDate,dataset,limit:500},range={from:Date.parse(`${fromDate}T00:00:00-03:00`),to:Date.parse(`${toDate}T00:00:00-03:00`)+86400000};
 const period=await s.history.loadPeriod(query),dashboard=await s.getDashboard(query,range);
 const groupReasons=Object.fromEntries([...new Set(dashboard.statistics.map(g=>g.capabilityReason??'available'))].map(reason=>[reason,dashboard.statistics.filter(g=>(g.capabilityReason??'available')===reason).length]));
 const hourly=buildHourly({...period,...period.effective},{date:toDate,now:Date.parse('2026-10-08T00:00:00-03:00'),target:null,microStopSeconds:60});
 const outsideWindow={production:period.production.filter(p=>p.endedAt<=range.from||p.startedAt>=range.to).length,stoppages:period.stoppages.filter(p=>p.endedAt!=null&&p.endedAt<=range.from||p.startedAt>=range.to).length};
 queries.push({product:product.name,window,fromDate,toDate,dataset,records:Object.fromEntries(['collections','production','losses','stoppages','reviews','corrections'].map(root=>[root,period[root].length])),tableCandidatesOutsideWindow:outsideWindow,complete:period.complete,parameterStates:Object.fromEntries([...new Set(dashboard.parameters.map(p=>p.state))].map(state=>[state,dashboard.parameters.filter(p=>p.state===state).length])),groups:dashboard.statistics.length,validSamples:dashboard.statistics.map(g=>g.nValid),capabilityReasons:groupReasons,notes:dashboard.notes,targetAlerts:dashboard.alerts.filter(a=>a.kind==='target').length,hourly:{allocatedHours:hourly.hours.filter(h=>h.grossPieces!=null).length,unallocatedRecords:hourly.unallocatedRecords}});
}
const report={checkedAt:new Date().toISOString(),workspace:'msa',readOnly:true,counts:Object.fromEntries(roots.map(root=>[root,rows(root).length])),origins:Object.fromEntries(['collections','production','losses','stoppages'].map(root=>[root,Object.fromEntries([...new Set(rows(root).map(r=>r.origin))].map(origin=>[origin,rows(root).filter(r=>r.origin===origin).length]))])),collectionDateRange:dates.length?[dates[0],dates.at(-1)]:null,referenceIssues:issues,hashes:Object.fromEntries(roots.map(root=>[root,createHash('sha256').update(JSON.stringify(data[root])).digest('hex')])),queries};
await writeFile(new URL('./auditoria-dados.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({counts:report.counts,origins:report.origins,dateRange:report.collectionDateRange,referenceIssues:issues,querySummary:queries.map(q=>({product:q.product,window:q.window,dataset:q.dataset,records:q.records,capabilityReasons:q.capabilityReasons,hourly:q.hourly}))}));
local.dispose();
