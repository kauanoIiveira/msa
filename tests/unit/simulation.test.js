import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {openSimulation,simulationCases} from '../../app/src/ui/simulation.js';
test('isolated scenarios exercise the same dashboard calculations without Firebase or persistence',async()=>{
 for(const scenario of simulationCases){
  const local=await openSimulation(scenario.id,{papa:Papa,now:()=>Date.parse('2026-10-06T01:00:00Z')});
  const q={context:local.context,fromDate:local.fromDate,toDate:local.toDate,limit:500};
  const d=await local.services.getDashboard(q,local.range);
  assert.equal(d.parameters.length,scenario.id==='complete'?2:scenario.id.startsWith('nhpl-')?0:41,'legacy seal references do not populate NHPL');
  const p=d.parameters.find(p=>p.code==='MSA_AX');
  if(scenario.id==='normal')assert.equal(p.state,'within');
  if(scenario.id==='outside')assert.equal(p.state,'outside');
  if(scenario.id==='missing')assert.equal(p.state,'missing');
  if(scenario.id==='invalid')assert.equal(p.state,'invalid');
  if(scenario.id==='constant')assert.equal(p.statistics[0].reason,'zero-dispersion');
  if(scenario.id==='insufficient')assert.equal(p.statistics[0].reason,'insufficient-data');
  if(scenario.id==='stoppage')assert.equal(d.totals.openStoppages,1);
  if(scenario.id==='losses')assert.ok(d.totals.rejectPercent>10);
  if(scenario.id==='pending')assert.equal(d.parameters.find(p=>p.code==='MSA_CH').state,'pending');
  assert.ok(d.totals.grossPieces>=d.totals.goodPieces);
  const repo=local.repo;local.dispose();await assert.rejects(repo.get('production'),{code:'STALE_SESSION'});
 }
 await assert.rejects(openSimulation('unknown',{papa:Papa}),{code:'INVALID_SCENARIO'});
});
