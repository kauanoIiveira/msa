import {readFile,writeFile} from 'node:fs/promises';
const file=new URL('../firebase/database.rules.json',import.meta.url),document=JSON.parse(await readFile(file,'utf8')),ws=document.rules.workspaces.$ws;
const base="root.child('workspaces').child($ws)",role=`${base}.child('members').child(auth.uid).child('role').val()`;
const access=roles=>`auth != null && (${roles.map(r=>`${role} == '${r}'`).join(' || ')})`,read=access(['admin','engineer','operator','viewer']),write=access(['admin','engineer','operator']);
const id={'.validate':"newData.isString() && newData.val().matches(/^[A-Za-z0-9_-]{1,100}$/)"},instant={'.validate':'newData.isNumber() && newData.val() >= 0 && newData.val() % 1 == 0'},text=max=>({'.validate':`newData.isString() && newData.val().length > 0 && newData.val().length <= ${max}`});
const previous=`${base}.child('coverageWitnesses').child(newData.child('supersedes').val())`;
const sameContext=['machineId','processId','productId','order','lot','shift','recipe','variant'].map(k=>`${previous}.child('context').child('${k}').val() == newData.child('context').child('${k}').val()`).join(' && ');
ws.coverageWitnesses={'.read':read,'$id':{
 '.write':`${write} && !data.exists() && newData.exists() && $id.matches(/^[A-Za-z0-9_-]{1,100}$/)`,
 '.validate':`newData.hasChildren(['id','context','startedAt','endedAt','complete','evidence','recordsFingerprint','createdBy','createdAt']) && newData.child('endedAt').val() > newData.child('startedAt').val() && (!newData.hasChild('supersedes') || (${previous}.exists() && ${previous}.child('startedAt').val() == newData.child('startedAt').val() && ${previous}.child('endedAt').val() == newData.child('endedAt').val() && ${sameContext}))`,
 id:{'.validate':'newData.val() == $id'},createdBy:{'.validate':'newData.val() == auth.uid'},createdAt:{'.validate':'newData.val() == now'},
 context:structuredClone(ws.collections.$id.context),startedAt:instant,endedAt:instant,complete:{'.validate':'newData.isBoolean()'},evidence:text(2000),recordsFingerprint:text(100000),supersedes:id,'$other':{'.validate':false}
}};
await writeFile(file,JSON.stringify(document,null,2)+'\n');
