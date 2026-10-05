import {writeFile} from 'node:fs/promises';
const ws="root.child('workspaces').child($ws)";
const member=`${ws}.child('members').child(auth.uid).child('role').val()`;
const roles=list=>`auth != null && (${list.map(role=>`${member} == '${role}'`).join(' || ')})`;
const reader=roles(['admin','operator','engineer','viewer']);
const editor=roles(['admin','engineer']);
const scalar=(condition,editable=false)=>({'.validate':`${condition}${editable?'':" && (!data.parent().exists() || newData.val() == data.val())"}`});
const string=(length=100,editable=false)=>scalar(`newData.isString() && newData.val().length > 0 && newData.val().length <= ${length}`,editable);
const boolean=(editable=false)=>scalar('newData.isBoolean()',editable);
const number=(extra='',editable=false)=>scalar(`newData.isNumber()${extra}`,editable);
const oneOf=(values,editable=false)=>scalar(`newData.isString() && (${values.map(v=>`newData.val() == '${v}'`).join(' || ')})`,editable);
const object=(required,fields,condition='true')=>({'.validate':`newData.hasChildren(${JSON.stringify(required)}) && (${condition}) && (${Object.keys(fields).filter(k=>!k.startsWith('$')).map(k=>`(!data.hasChild('${k}') || newData.hasChild('${k}'))`).join(' && ')||'true'})`,...fields,'$other':{'.validate':false}});
const meta={id:scalar('newData.isString() && newData.val() == $id'),createdBy:scalar('newData.isString() && (!data.parent().exists() ? newData.val() == auth.uid : newData.val() == data.val())'),createdAt:scalar('newData.isNumber() && (!data.parent().exists() ? newData.val() == now : newData.val() == data.val())')};
const activeRef=(collection,expr)=>`${ws}.child('${collection}').child(${expr}).child('active').val() == true`;
const date=()=>scalar("newData.isString() && newData.val().matches(/^([0-9]{4}-(0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|[0-9]{4}-(0[469]|11)-(0[1-9]|[12][0-9]|30)|[0-9]{4}-02-(0[1-9]|1[0-9]|2[0-8])|([0-9]{2}(0[48]|[2468][048]|[13579][26])|([02468][048]|[13579][26])00)-02-29)$/)");
const context=()=>object(['machineId','processId','productId'],{
  machineId:string(),processId:string(),productId:string(),recipe:string(),lot:string(),order:string(),shift:string()
},`data.exists() || (${activeRef('machines',"newData.child('machineId').val()")} && ${activeRef('processes',"newData.child('processId').val()")} && ${activeRef('products',"newData.child('productId').val()")} && ${ws}.child('processes').child(newData.child('processId').val()).child('machineId').val() == newData.child('machineId').val() && ${ws}.child('products').child(newData.child('productId').val()).child('processIds').child(newData.child('processId').val()).val() == true)`);
const collection=(fields,required,write,condition='true',indices=[])=>({'.read':reader,...(indices.length?{'.indexOn':indices}:{}),'$id':{'.write':`${write} && newData.exists() && $id.matches(/^[A-Za-z0-9_-]{1,100}$/)`,...object(required,fields,condition)}});
const registry=(extras={},required=[],writer=roles(['admin']),condition='true')=>{
  const node=collection({...meta,name:string(160,true),code:string(100,true),active:boolean(true),...extras},['id','name','active','createdBy','createdAt',...required],`${writer} && !data.exists()`,condition);
  for(const key of ['name','code','active']) node.$id[key]['.write']=`${writer} && data.parent().exists() && newData.exists()`;
  return node;
};
const rules={'.read':false,'.write':false,workspaces:{$ws:{
  members:{$uid:{'.read':`auth != null && auth.uid == $uid && (${['admin','operator','engineer','viewer'].map(r=>`data.child('role').val() == '${r}'`).join(' || ')})`,'.write':false}},
  machines:registry(),
  processes:registry({machineId:string()},['machineId'],roles(['admin']),`data.exists() || ${activeRef('machines',"newData.child('machineId').val()")}`),
  products:registry({processIds:{'.validate':'newData.hasChildren()','$pid':{'.validate':`$pid.matches(/^[A-Za-z0-9_-]{1,100}$/) && newData.val() == true && (data.parent().exists() ? data.val() == true : ${activeRef('processes','$pid')})`}}},['processIds']),
  parameters:registry({processId:string()},['processId'],roles(['admin']),`data.exists() || ${activeRef('processes',"newData.child('processId').val()")}`),
  reasons:registry({kind:oneOf(['stop','reject','material','rework'])},['kind']),
  targets:registry({metric:oneOf(['producedPieces','stopMinutes','rejectedPieces','lossKg']),unit:oneOf(['pieces','minutes','kg']),fromDate:date(),toDate:date(),context:context(),operator:oneOf(['lower','upper']),threshold:number(' && newData.val() >= 0')},['metric','unit','fromDate','toDate','context','operator','threshold'],editor,"newData.child('fromDate').val() <= newData.child('toDate').val() && ((newData.child('metric').val() == 'lossKg' && newData.child('unit').val() == 'kg') || (newData.child('metric').val() == 'stopMinutes' && newData.child('unit').val() == 'minutes') || ((newData.child('metric').val() == 'producedPieces' || newData.child('metric').val() == 'rejectedPieces') && newData.child('unit').val() == 'pieces'))"),
  parameterVersions:collection({...meta,parameterId:string(),unit:string(30),nature:oneOf(['measurement','setpoint']),status:oneOf(['draft','approved']),rule:object(['kind'],{kind:oneOf(['range','lower','upper','pending']),lower:number(),upper:number()},"(newData.child('kind').val() == 'pending' && !newData.hasChild('lower') && !newData.hasChild('upper')) || (newData.child('kind').val() == 'range' && newData.hasChildren(['lower','upper']) && newData.child('lower').val() < newData.child('upper').val()) || (newData.child('kind').val() == 'lower' && newData.hasChild('lower') && !newData.hasChild('upper')) || (newData.child('kind').val() == 'upper' && newData.hasChild('upper') && !newData.hasChild('lower'))")},['id','parameterId','unit','nature','status','rule','createdBy','createdAt'],`${editor} && !data.exists()`,`${activeRef('parameters',"newData.child('parameterId').val()")} && (newData.child('rule').child('kind').val() != 'pending' || newData.child('status').val() == 'draft')`)
}}};
const operator=roles(['admin','operator','engineer']);
const immutableWrite=`${operator} && !data.exists()`;
const instant=(editable=false)=>number(' && newData.val() >= 0 && newData.val() % 1 == 0',editable);
const envelope={...meta,context:context(),origin:oneOf(['manual','import','demo']),eventDate:date(),timePrecision:oneOf(['date','instant']),occurredAt:instant(),source:object(['file'],{file:string(240),sheet:string(),row:number(' && newData.val() >= 1 && newData.val() % 1 == 0'),cells:string(2000)})};
const envelopeKeys=['id','context','origin','eventDate','timePrecision','createdBy','createdAt'];
const timeCondition="(newData.child('timePrecision').val() == 'instant' && newData.hasChild('occurredAt')) || (newData.child('timePrecision').val() == 'date' && newData.child('origin').val() == 'import' && !newData.hasChild('occurredAt'))";
const parameterRoot=`${ws}.child('parameters').child($pid)`;
const versionRoot=`${ws}.child('parameterVersions').child(newData.child('versionId').val())`;
const reading=object(['parameterId','versionId','status'],{parameterId:scalar('newData.val() == $pid'),versionId:string(),raw:string(100),status:oneOf(['valid','missing','invalid']),value:number()},`((newData.child('status').val() == 'valid' && newData.hasChild('value') && newData.hasChild('raw')) || (newData.child('status').val() != 'valid' && !newData.hasChild('value'))) && ${parameterRoot}.child('active').val() == true && ${parameterRoot}.child('processId').val() == newData.parent().parent().child('context').child('processId').val() && ${versionRoot}.child('parameterId').val() == $pid`);
reading.raw=scalar('newData.isString() && newData.val().length <= 100');
const nodes=rules.workspaces.$ws;
nodes.collections=collection({...envelope,readings:{'.validate':'newData.hasChildren()','$pid':reading}},[...envelopeKeys,'readings'],immutableWrite,timeCondition,['eventDate']);
nodes.production=collection({...envelope,quantity:number(' && newData.val() >= 0 && newData.val() <= 1000000000000 && newData.val() % 1 == 0'),basis:oneOf(['gross','good']),startedAt:instant(),endedAt:instant()},[...envelopeKeys,'quantity','basis','startedAt','endedAt'],immutableWrite,`(${timeCondition}) && newData.child('timePrecision').val() == 'instant' && newData.child('endedAt').val() > newData.child('startedAt').val()`,['eventDate']);
const reasonCondition=kind=>`${ws}.child('reasons').child(newData.child('reasonId').val()).child('active').val() == true && ${ws}.child('reasons').child(newData.child('reasonId').val()).child('kind').val() == ${kind}`;
nodes.losses=collection({...envelope,kind:oneOf(['reject','material','rework']),unit:oneOf(['pieces','kg']),amount:number(' && newData.val() > 0 && newData.val() <= 1000000000000'),reasonId:string()},[...envelopeKeys,'kind','unit','amount','reasonId'],immutableWrite,`(${timeCondition}) && (${reasonCondition("newData.child('kind').val()")}) && (newData.child('unit').val() == 'kg' || newData.child('amount').val() % 1 == 0)`,['eventDate']);
nodes.stoppages=collection({...envelope,startedAt:instant(),planned:boolean(),reasonId:string(),endedAt:instant(true),closedBy:string(100,true),closedAt:instant(true)},[...envelopeKeys,'startedAt','planned','reasonId'],`${operator} && (!data.exists() ? !newData.hasChild('endedAt') : !data.hasChild('endedAt') && newData.hasChildren(['endedAt','closedBy','closedAt']))`,`(${timeCondition}) && newData.child('timePrecision').val() == 'instant' && (${reasonCondition("'stop'")}) && (!newData.hasChild('endedAt') ? !newData.hasChild('closedBy') && !newData.hasChild('closedAt') : newData.child('endedAt').val() > newData.child('startedAt').val() && newData.child('closedBy').val() == auth.uid && newData.child('closedAt').val() == now)`,['eventDate']);
const justification=()=>scalar("newData.isString() && newData.val().length <= 2000 && newData.val().replace(' ', '').replace('\\n', '').replace('\\r', '').replace('\\t', '').length > 0");
const reviewEvent=states=>object(['state','by','at'],{
  state:oneOf(states),
  by:scalar('newData.isString() && (!data.parent().exists() ? newData.val() == auth.uid : newData.val() == data.val())'),
  at:scalar('newData.isNumber() && (!data.parent().exists() ? newData.val() == now : newData.val() == data.val())'),
  justification:justification()
});
const finalEvent=reviewEvent(['approved','rejected']);
finalEvent['.validate']+=" && newData.hasChild('justification') && newData.child('state').val() == newData.parent().parent().child('state').val()";
const history=object(['0'],{'0':reviewEvent(['waiting']),'1':reviewEvent(['analyzing']),'2':finalEvent},"(newData.parent().child('state').val() == 'waiting' && !newData.hasChild('1') && !newData.hasChild('2')) || (newData.parent().child('state').val() == 'analyzing' && newData.hasChild('1') && !newData.hasChild('2')) || ((newData.parent().child('state').val() == 'approved' || newData.parent().child('state').val() == 'rejected') && newData.hasChildren(['1','2']))");
const transition="(data.child('state').val() == 'waiting' && newData.child('state').val() == 'analyzing') || (data.child('state').val() == 'analyzing' && (newData.child('state').val() == 'approved' || newData.child('state').val() == 'rejected'))";
const reviewContext=object(['machineId','processId','productId'],Object.fromEntries(['machineId','processId','productId','recipe','lot','order','shift'].map(key=>[key,scalar(`newData.val() == ${ws}.child('collections').child(newData.parent().parent().child('collectionId').val()).child('context').child('${key}').val()`)])));
nodes.reviews=collection({...meta,eventDate:date(),context:reviewContext,collectionId:string(),scope:justification(),state:oneOf(['waiting','analyzing','approved','rejected'],true),history},['id','eventDate','context','collectionId','scope','state','history','createdBy','createdAt'],`(!data.exists() ? (${operator} && newData.child('state').val() == 'waiting') : (${editor} && (${transition})))`,`${ws}.child('collections').child(newData.child('collectionId').val()).exists() && newData.child('eventDate').val() == ${ws}.child('collections').child(newData.child('collectionId').val()).child('eventDate').val()`,['eventDate']);
const original=`${ws}.child(newData.parent().child('recordType').val()).child(newData.parent().child('recordId').val())`;
const originalField=`${ws}.child(newData.parent().parent().child('recordType').val()).child(newData.parent().parent().child('recordId').val())`;
const replacementFields={};
const types=['collections','production','losses','stoppages'];
for(const type of types) {
  for(const [key,value] of Object.entries(nodes[type].$id)) if(!key.startsWith('.')&&!key.startsWith('$')) replacementFields[key]=structuredClone(value);
}
for(const value of Object.values(replacementFields)) {
  if(Object.keys(value).every(key=>key.startsWith('.'))) value['.validate']+=" && (!data.parent().exists() || newData.val() == data.val())";
}
// A replacement is an immutable revision embedded in its correction, not another live operation.
for(const key of ['id','createdBy','createdAt','origin','eventDate','timePrecision','occurredAt','kind','unit','basis','planned','closedBy','closedAt']) {
  if(!replacementFields[key]) continue;
  replacementFields[key]=scalar(`newData.val() == ${originalField}.child('${key}').val()`);
}
replacementFields.context=context();
for(const key of ['machineId','processId','productId','recipe','lot','order','shift']) {
  const ref=`${ws}.child(newData.parent().parent().parent().child('recordType').val()).child(newData.parent().parent().parent().child('recordId').val()).child('context').child('${key}')`;
  replacementFields.context[key]=scalar(`newData.val() == ${ref}.val()`);
  const contextOriginal=`${ws}.child(newData.parent().parent().child('recordType').val()).child(newData.parent().parent().child('recordId').val())`;
  replacementFields.context['.validate']+=` && (!${contextOriginal}.child('context').child('${key}').exists() || newData.hasChild('${key}'))`;
}
const allFields=Object.keys(replacementFields);
const revisionReadingOriginal=`${ws}.child('collections').child(newData.parent().parent().parent().child('recordId').val()).child('readings').child(newData.child('parameterId').val())`;
const revisionReading=object(['parameterId','versionId','status'],{parameterId:string(),versionId:string(),status:oneOf(['valid','missing','invalid']),raw:scalar('newData.isString() && newData.val().length <= 100'),value:number()},`${revisionReadingOriginal}.exists() && newData.child('versionId').val() == ${revisionReadingOriginal}.child('versionId').val() && ((newData.child('status').val() == 'valid' && newData.hasChildren(['value','raw'])) || (newData.child('status').val() != 'valid' && !newData.hasChild('value')))`);
replacementFields.readings=object(['0'],Object.fromEntries(Array.from({length:100},(_,i)=>[String(i),structuredClone(revisionReading)])));
for(const key of ['file','sheet','row','cells']) {
  const sourceField=`${ws}.child(newData.parent().parent().parent().child('recordType').val()).child(newData.parent().parent().parent().child('recordId').val()).child('source').child('${key}')`;
  replacementFields.source[key]=scalar(`newData.val() == ${sourceField}.val()`);
  replacementFields.source['.validate']+=` && (!${originalField}.child('source').child('${key}').exists() || newData.hasChild('${key}'))`;
}
const replacementConditions=types.map(type=>{
  const fields=Object.keys(nodes[type].$id).filter(k=>!k.startsWith('.')&&!k.startsWith('$'));
  const required={collections:[...envelopeKeys,'readings'],production:[...envelopeKeys,'quantity','basis','startedAt','endedAt'],losses:[...envelopeKeys,'kind','unit','amount','reasonId'],stoppages:[...envelopeKeys,'startedAt','planned','reasonId','endedAt','closedBy','closedAt']}[type];
  return `(newData.parent().child('recordType').val() == '${type}' && newData.hasChildren(${JSON.stringify(required)}) && ${allFields.filter(k=>!fields.includes(k)).map(k=>`!newData.hasChild('${k}')`).join(' && ')||'true'}${type==='production'||type==='stoppages'?" && newData.child('endedAt').val() > newData.child('startedAt').val()":''}${type==='losses'?" && (newData.child('unit').val() == 'kg' || newData.child('amount').val() % 1 == 0)":''})`;
});
const replacement=object(envelopeKeys,replacementFields,`${original}.exists() && (${replacementConditions.join(' || ')}) && ${['occurredAt','source','kind','unit','basis','planned','closedBy','closedAt'].map(key=>`(newData.hasChild('${key}') == ${original}.hasChild('${key}'))`).join(' && ')} && (!newData.hasChild('reasonId') || (${ws}.child('reasons').child(newData.child('reasonId').val()).child('kind').val() == (newData.parent().child('recordType').val() == 'stoppages' ? 'stop' : newData.child('kind').val())))`);
const correctionDecision=reviewEvent(['approved','rejected']);
correctionDecision['.validate']+=" && newData.hasChild('justification') && newData.child('state').val() == newData.parent().child('state').val()";
nodes.corrections=collection({...meta,eventDate:date(),recordType:oneOf(types),recordId:string(),reason:justification(),state:oneOf(['waiting','approved','rejected'],true),replacement,decision:correctionDecision},['id','eventDate','recordType','recordId','reason','state','replacement','createdBy','createdAt'],`(!data.exists() ? (${operator} && newData.child('state').val() == 'waiting' && !newData.hasChild('decision')) : (${editor} && data.child('createdBy').val() != auth.uid && data.child('state').val() == 'waiting' && (newData.child('state').val() == 'approved' || newData.child('state').val() == 'rejected') && newData.hasChild('decision')))`,`${ws}.child(newData.child('recordType').val()).child(newData.child('recordId').val()).exists() && newData.child('eventDate').val() == ${ws}.child(newData.child('recordType').val()).child(newData.child('recordId').val()).child('eventDate').val()`,['eventDate']);
await writeFile(new URL('./database.rules.json',import.meta.url),JSON.stringify({rules},null,2)+'\n');
