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
const object=(required,fields,condition='true')=>({'.validate':`newData.hasChildren(${JSON.stringify(required)}) && (${condition})`,...fields,'$other':{'.validate':false}});
const meta={id:scalar('newData.isString() && newData.val() == $id'),createdBy:scalar('newData.isString() && (!data.parent().exists() ? newData.val() == auth.uid : newData.val() == data.val())'),createdAt:scalar('newData.isNumber() && (!data.parent().exists() ? newData.val() == now : newData.val() == data.val())')};
const activeRef=(collection,expr)=>`${ws}.child('${collection}').child(${expr}).child('active').val() == true`;
const context=()=>object(['machineId','processId','productId'],{
  machineId:string(),processId:string(),productId:string(),recipe:string(),lot:string(),order:string(),shift:string()
},`data.exists() || (${activeRef('machines',"newData.child('machineId').val()")} && ${activeRef('processes',"newData.child('processId').val()")} && ${activeRef('products',"newData.child('productId').val()")} && ${ws}.child('processes').child(newData.child('processId').val()).child('machineId').val() == newData.child('machineId').val() && ${ws}.child('products').child(newData.child('productId').val()).child('processIds').child(newData.child('processId').val()).val() == true)`);
const collection=(fields,required,write,condition='true',indices=[])=>({'.read':reader,...(indices.length?{'.indexOn':indices}:{}),'$id':{'.write':`${write} && newData.exists() && $id.matches(/^[A-Za-z0-9_-]{1,100}$/)`,...object(required,fields,condition)}});
const registry=(extras={},required=[],writer=roles(['admin']),condition='true')=>collection({...meta,name:string(160,true),code:string(100,true),active:boolean(true),...extras},['id','name','active','createdBy','createdAt',...required],writer,condition);
const rules={'.read':false,'.write':false,workspaces:{$ws:{
  members:{$uid:{'.read':`auth != null && auth.uid == $uid && (${['admin','operator','engineer','viewer'].map(r=>`data.child('role').val() == '${r}'`).join(' || ')})`,'.write':false}},
  machines:registry(),
  processes:registry({machineId:string()},['machineId'],roles(['admin']),`data.exists() || ${activeRef('machines',"newData.child('machineId').val()")}`),
  products:registry({processIds:{'.validate':'newData.hasChildren()','$pid':{'.validate':`$pid.matches(/^[A-Za-z0-9_-]{1,100}$/) && newData.val() == true && (data.parent().exists() ? data.val() == true : ${activeRef('processes','$pid')})`}}},['processIds']),
  parameters:registry({processId:string()},['processId'],roles(['admin']),`data.exists() || ${activeRef('processes',"newData.child('processId').val()")}`),
  reasons:registry({kind:oneOf(['stop','reject','material','rework'])},['kind']),
  targets:registry({metric:oneOf(['producedPieces','stopMinutes','rejectedPieces','lossKg']),unit:oneOf(['pieces','minutes','kg']),fromDate:string(10),toDate:string(10),context:context(),operator:oneOf(['lower','upper']),threshold:number(' && newData.val() >= 0')},['metric','unit','fromDate','toDate','context','operator','threshold'],editor,"newData.child('fromDate').val() <= newData.child('toDate').val() && ((newData.child('metric').val() == 'lossKg' && newData.child('unit').val() == 'kg') || (newData.child('metric').val() == 'stopMinutes' && newData.child('unit').val() == 'minutes') || ((newData.child('metric').val() == 'producedPieces' || newData.child('metric').val() == 'rejectedPieces') && newData.child('unit').val() == 'pieces'))"),
  parameterVersions:collection({...meta,parameterId:string(),unit:string(30),nature:oneOf(['measurement','setpoint']),status:oneOf(['draft','approved']),rule:object(['kind'],{kind:oneOf(['range','lower','upper','pending']),lower:number(),upper:number()},"(newData.child('kind').val() == 'pending' && !newData.hasChild('lower') && !newData.hasChild('upper')) || (newData.child('kind').val() == 'range' && newData.hasChildren(['lower','upper']) && newData.child('lower').val() < newData.child('upper').val()) || (newData.child('kind').val() == 'lower' && newData.hasChild('lower') && !newData.hasChild('upper')) || (newData.child('kind').val() == 'upper' && newData.hasChild('upper') && !newData.hasChild('lower'))")},['id','parameterId','unit','nature','status','rule','createdBy','createdAt'],`${editor} && !data.exists()`,`${activeRef('parameters',"newData.child('parameterId').val()")} && (newData.child('rule').child('kind').val() != 'pending' || newData.child('status').val() == 'draft')`)
}}};
await writeFile(new URL('./database.rules.json',import.meta.url),JSON.stringify({rules},null,2)+'\n');
