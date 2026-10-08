import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {openSimulation} from '../../app/src/ui/simulation.js';
test('NHPL simulation keeps membership role and demonstrates exact productivity without Firebase',async()=>{
 const local=await openSimulation('nhpl-met',{papa:Papa,now:()=>Date.parse('2026-10-07T20:00:00-03:00'),effectiveActor:{uid:'view',role:'viewer'}});
 try{assert.equal(local.actor.role,'viewer');const view=await local.services.getProductivity({context:local.context,fromDate:local.fromDate,toDate:local.toDate},local.range);assert.equal(view.segments[0].percent,95);await assert.rejects(()=>local.services.planning.approve({}),{code:'FORBIDDEN'});assert.equal(await local.repo.get('parameters'),null);}finally{local.dispose();}
});
