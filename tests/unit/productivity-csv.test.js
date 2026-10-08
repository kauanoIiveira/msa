import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {openSimulation} from '../../app/src/ui/simulation.js';
import {productivityReport} from '../../app/src/ui/nhpl.js';
test('productivity CSV preserves context, policy, plan, basis, zero and missing values',async()=>{
 const local=await openSimulation('nhpl-met',{papa:Papa});try{
 const period=await local.services.history.loadPeriod({context:local.context,fromDate:local.fromDate,toDate:local.toDate}),state={period,context:local.context,fromDate:local.fromDate,toDate:local.toDate};
 const rows=productivityReport(state),row=rows[0];assert.equal(row.percent,95);assert.equal(row.basis,'gross');assert.equal(row.order,'OP-SIM');assert.equal(row.taktSeconds,12);assert.ok(row.planRevisionId&&row.policyRevisionId);assert.equal(row.remainingPieces,0);assert.equal(row.goodPieces,null);assert.equal(row.coverageComplete,true);
 const columns=Object.keys(row),csv=await local.services.csv.exportRecords(rows,columns),parsed=Papa.parse(csv,{delimiter:';',header:true}).data[0];assert.equal(parsed.remainingPieces,'0');assert.equal(parsed.goodPieces,'');assert.doesNotMatch(csv,/\[object Promise\]/);
 }finally{local.dispose();}
});
