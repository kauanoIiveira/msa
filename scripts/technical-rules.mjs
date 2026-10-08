import {readFile,writeFile} from 'node:fs/promises';
const file=new URL('../firebase/database.rules.json',import.meta.url),document=JSON.parse(await readFile(file,'utf8')),ws=document.rules.workspaces.$ws;
const base="root.child('workspaces').child($ws)",role=`${base}.child('members').child(auth.uid).child('role').val()`,read=`auth != null && (${['admin','engineer','operator','viewer'].map(r=>`${role} == '${r}'`).join(' || ')})`,op=`(${role} == 'admin' || ${role} == 'engineer' || ${role} == 'operator')`,eng=`(${role} == 'admin' || ${role} == 'engineer')`;
const text=max=>({'.validate':`newData.isString() && newData.val().length > 0 && newData.val().length <= ${max}`}),instant={'.validate':'newData.isNumber() && newData.val() >= 0 && newData.val() % 1 == 0'},id={'.validate':"newData.isString() && newData.val().matches(/^[A-Za-z0-9_-]{1,100}$/)"},bool={'.validate':'newData.isBoolean()'};
const kind="newData.child('kind').val()",needs=(type,keys)=>`(${kind} == '${type}' && newData.hasChildren(${JSON.stringify(keys)}))`;
const branches=[
 needs('reference',['context','idealSeconds','microStopSeconds','effectiveFrom','source']),
 needs('inspection',['context','intervalId','firstPassGood','historyComplete','note','productionFingerprint']),
 needs('classification',['context','stopId','category','failure','note','stopFingerprint']),
 needs('occurrence',['context','type','note','occurredAt','state']),
 needs('occurrence-decision',['context','occurrenceId','decision','note']),
 needs('evidence',['reviewId','controlPlan','inspection','testResult','performance','note']),
 needs('event',['context','event','occurredAt','gap'])
];
 ws.technicalRecords={'.read':read,$id:{
 '.write':`auth != null && !data.exists() && newData.exists() && $id.matches(/^[A-Za-z0-9_-]{1,100}$/) && (${op}) && ((newData.child('kind').val() == 'inspection' || newData.child('kind').val() == 'occurrence' || newData.child('kind').val() == 'event') || ${eng})`,
 '.validate':`newData.hasChildren(['id','kind','createdBy','createdAt','eventDate']) && (${branches.join(' || ')}) && (!newData.hasChild('intervalId') || ${base}.child('productionIntervals').child(newData.child('intervalId').val()).exists()) && (!newData.hasChild('stopId') || ${base}.child('stoppages').child(newData.child('stopId').val()).exists()) && (!newData.hasChild('reviewId') || ${base}.child('reviews').child(newData.child('reviewId').val()).exists()) && (!newData.hasChild('occurrenceId') || ${base}.child('technicalRecords').child(newData.child('occurrenceId').val()).child('kind').val() == 'occurrence')`,
 id:{'.validate':'newData.val() == $id'},kind:text(40),createdBy:{'.validate':'newData.val() == auth.uid'},createdAt:{'.validate':'newData.isNumber() && newData.val() == now'},eventDate:{'.validate':"newData.isString() && newData.val().matches(/^\\d{4}-\\d{2}-\\d{2}$/)"},
 context:structuredClone(ws.collections.$id.context),origin:{'.validate':"newData.val() == 'demo' || newData.val() == 'manual' || newData.val() == 'import'"},
 idealSeconds:{'.validate':'newData.isNumber() && newData.val() > 0 && newData.val() <= 3600'},microStopSeconds:{'.validate':'newData.isNumber() && newData.val() > 0 && newData.val() <= 3600 && newData.val() % 1 == 0'},effectiveFrom:instant,source:text(2000),supersedes:id,
 intervalId:id,firstPassGood:{'.validate':'newData.isNumber() && newData.val() >= 0 && newData.val() % 1 == 0'},historyComplete:bool,note:text(2000),productionFingerprint:text(100000),stopFingerprint:text(2000),stopId:id,
 category:{'.validate':"newData.val() == 'availability' || newData.val() == 'performance' || newData.val() == 'outside-plan'"},failure:bool,repairStartedAt:instant,repairEndedAt:instant,
 type:{'.validate':"newData.val() == 'process' || newData.val() == 'quality' || newData.val() == 'maintenance' || newData.val() == 'safety'"},occurredAt:instant,state:{'.validate':"newData.val() == 'waiting'"},occurrenceId:id,decision:{'.validate':"newData.val() == 'analyzing' || newData.val() == 'resolved' || newData.val() == 'new-analysis'"},reviewId:id,controlPlan:text(2000),inspection:text(2000),testResult:text(2000),performance:text(2000),gap:bool,
 event:{'.validate':"newData.hasChildren(['schemaVersion','sourceId','eventId','sequence','occurredAt','context','type'])",schemaVersion:{'.validate':'newData.val() == 1'},sourceId:id,eventId:id,sequence:{'.validate':'newData.isNumber() && newData.val() > 0 && newData.val() % 1 == 0'},occurredAt:instant,context:structuredClone(ws.collections.$id.context),type:{'.validate':"newData.val() == 'state' || newData.val() == 'good-validated' || newData.val() == 'production' || newData.val() == 'counter' || newData.val() == 'measurement'"},state:text(40),validated:bool,reasonId:id,quantity:{'.validate':'newData.isNumber() && newData.val() >= 0 && newData.val() % 1 == 0'},basis:{'.validate':"newData.val() == 'gross' || newData.val() == 'good'"},intervalId:id,epoch:id,count:{'.validate':'newData.isNumber() && newData.val() >= 0 && newData.val() % 1 == 0'},parameterId:id,versionId:id,raw:{'.validate':'newData.isString() && newData.val().length <= 200'},$other:{'.validate':false}},
 $other:{'.validate':false}
}};
ws.productionIntervals.$id.events.$event.origin['.validate']="newData.val() == 'manual' || newData.val() == 'demo' || newData.val() == 'import'";
ws.technicalRecords.$id.baseline=bool;
ws.stoppages.$id.goodValidated={'.validate':'newData.val() == true'};
if(!ws.stoppages.$id['.validate'].includes("child('goodValidated')"))ws.stoppages.$id['.validate']+=" && (newData.child('context').child('machineId').val() != 'nhpl' || !newData.hasChild('endedAt') || newData.child('goodValidated').val() == true)";
const originalStop=`${base}.child(newData.parent().parent().child('recordType').val()).child(newData.parent().parent().child('recordId').val())`;
ws.corrections.$id.replacement.goodValidated={'.validate':`newData.val() == ${originalStop}.child('goodValidated').val()`};
const productionValidation=ws.productionIntervals.$id.events.$event;
if(!productionValidation['.validate'].includes("newData.child('endedAt').val() <= now"))productionValidation['.validate']+=" && (newData.child('kind').val() != 'production' || newData.child('endedAt').val() <= now)";
for(const kind of ['machines','processes','products','parameters','reasons']){
 const record=ws[kind].$id;
 for(const target of [record,...['name','code','active'].map(k=>record[k]).filter(Boolean)])if(target['.write']&&!target['.write'].includes("== 'engineer'"))target['.write']=target['.write'].replace(`${role} == 'admin'`,eng);
}
await writeFile(file,JSON.stringify(document,null,2)+'\n');console.log('Regras técnicas locais geradas; não publicadas.');
