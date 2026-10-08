import vm from 'node:vm';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root='C:/Users/Kauan/Pictures/MSE',out=import.meta.dirname;
const context=vm.createContext({Date,console,setInterval,clearInterval});context.window=context;
for(const file of ['config.js','metrics.js','telemetry-service.js'])vm.runInContext(await readFile(resolve(root,'dist/assets',file),'utf8'),context);
const metrics=context.MSA.metrics,telemetry=context.MSA.telemetry;
const from=Date.UTC(2026,9,5),to=from+86400000;
const machine={id:'NHPL',metaDiaria:200,parametros:{forca:{min:0,max:20}}};
const data={registrosProducao:[{id:'r1',maquinaId:'NHPL',inicio:from,fim:to,quantidade:200}],leituras:[{id:'l1',maquinaId:'NHPL',data:from,valores:{forca:10}}]};
const before=metrics.summarize(data,[machine],from,to);machine.metaDiaria=400;const after=metrics.summarize(data,[machine],from,to);
assert.equal(before.atendimento,100);assert.equal(after.atendimento,50);
const empty=metrics.summarize({},[machine],from,to);assert.equal(empty.aprovadas,0);assert.equal(empty.atendimento,0);
const cut=metrics.summarize(data,[machine],to-3600000,to);assert.equal(cut.aprovadas,200);
const boundary=metrics.summarize(data,[machine],from,to-3600000);assert.equal(boundary.aprovadas,0);
const initial=metrics.deviations(data,[machine]);machine.parametros.forca.max=5;const changed=metrics.deviations(data,[machine]);assert.equal(initial.length,0);assert.equal(changed.length,1);
const sample={operatingSeconds:3000,plannedSeconds:3600,totalCount:250,goodCount:240,idealCycleSeconds:10,partsPerCycle:1};
const oee=telemetry.efficiency(sample);assert.ok(Math.abs(oee.oee-2400/3600*100)<1e-10);
const zero=telemetry.efficiency({...sample,totalCount:0,goodCount:0});assert.equal(zero,null);
const simulation=telemetry.get('NHPL');assert.equal(simulation.idealCycleSeconds,11);assert.equal(simulation.parameters.forca.min,350);assert.equal(simulation.parameters.forca.max,450);
await writeFile(resolve(out,'probes.json'),JSON.stringify({
 historicalTarget:{sameRecords:true,before:before.atendimento,after:after.atendimento},
 emptyDataset:{goodPieces:empty.aprovadas,attainment:empty.atendimento,notes:'No coverage/confirmation flags required.'},
 periodCut:{wholeDayRecordCountedInLastHour:cut.aprovadas,first23Hours:boundary.aprovadas,notes:'Attribution uses end-1, not measured distribution.'},
 limits:{sameReading:10,initialDeviationCount:initial.length,afterCurrentLimitChange:changed.length},
 formula:{input:sample,result:oee,zeroConfirmedProduction:zero},
 nhplSimulation:{idealCycleSeconds:simulation.idealCycleSeconds,force:simulation.parameters.forca,notes:'Synthetic defaults, not approved factory references.'}
},null,2));console.log('Probes reproduced: mutable historical target/limits, empty=0, end-time period attribution; OEE formula valid for supplied complete bases; NHPL default cycle/force synthetic.');
