import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {openUnifiedWorkspace} from '../../app/src/ui/unified-workspace.js';
import {loadOperationalView} from '../../app/src/ui/operational-query.js';
import {technicalView} from '../../app/src/ui/technical.js';
import {formMarkup,submitForm} from '../../app/src/ui/forms.js';
const now=()=>Date.parse('2026-10-08T14:30:00-03:00');
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};};
test('one workspace has records and calculable metrics for both products and all three shifts',async()=>{
 const w=await openUnifiedWorkspace({storage:memory(),papa:Papa,now,actor:{uid:'a',role:'admin'}});
 try{assert.equal(w.live,undefined);for(const productId of ['nhpl-vgard-hp','nhpl-mark-v'])for(const shift of ['1','2','3']){
  const context={...w.context,productId},view=await loadOperationalView({services:w.services,repo:w.repo,consultation:{context,shift,fromDate:w.fromDate,toDate:w.toDate},now:now()});
  assert.ok(view.period.effective.production.length>0,productId+' '+shift);assert.ok(view.period.effective.collections.length>=30);assert.ok(view.period.effective.losses.length>0);
  const m=technicalView({...view,context,fromDate:w.fromDate,toDate:w.toDate,client:w});assert.ok(m.aggregate.oee>0);assert.ok(m.reliability.mttr.value>0);
  assert.ok(Object.values(await w.repo.get('reviews')).some(r=>r.context.productId===productId));
  const collections=await w.repo.get('collections');assert.ok(Object.values(await w.repo.get('corrections')).some(r=>collections[r.recordId]?.context.productId===productId));
 }assert.ok(Object.keys(await w.repo.get('targets')).length>0);assert.ok(Object.values(await w.repo.get('stoppages')).some(s=>s.endedAt==null));}
 finally{w.dispose();}
});
test('target cadastro accepts an explicit OP, lot and shift from a broad consultation',async()=>{
 const w=await openUnifiedWorkspace({storage:memory(),papa:Papa,now,actor:{uid:'a',role:'admin'}});try{
  const markup=formMarkup('target',{context:w.context,registries:{}});assert.ok(markup.includes('name="context_order"'));
  const data=new FormData();for(const [key,value]of Object.entries({name:'Meta cadastrada',metric:'producedPieces',threshold:'200',operator:'lower',fromDate:'2026-10-07',toDate:'2026-10-08',context_order:'OP-META',context_lot:'L-META',context_shift:'1'}))data.set(key,value);
  const target=await submitForm('target',data,{services:w.services,context:w.context});assert.equal(target.context.order,'OP-META');
 }finally{w.dispose();}
});
test('cadastros persist, seed only runs once, viewer stays read-only and previous live backup is retained',async()=>{
 const storage=memory();storage.setItem('msa.nhpl.live.v1',JSON.stringify({schemaVersion:1,mode:'live',data:{old:'preserved'}}));
 let w=await openUnifiedWorkspace({storage,papa:Papa,now,actor:{uid:'a',role:'admin'}});
 const created=await w.services.registry.create('machines',{name:'Máquina cadastrada',code:'MC-1'}),count=Object.keys(await w.repo.get('collections')).length;w.dispose();
 w=await openUnifiedWorkspace({storage,papa:Papa,now,actor:{uid:'v',role:'viewer'}});try{assert.equal((await w.repo.get('machines/'+created.id)).name,'Máquina cadastrada');assert.equal(Object.keys(await w.repo.get('collections')).length,count);assert.deepEqual(JSON.parse(w.exportBackup()).previousLiveWorkspace.data,{old:'preserved'});await assert.rejects(w.services.registry.create('machines',{name:'Não autorizado'}),{code:'FORBIDDEN'});}finally{w.dispose();}
});
