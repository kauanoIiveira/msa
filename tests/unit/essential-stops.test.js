import test from 'node:test';
import assert from 'node:assert/strict';
import {createTechnicalService} from '../../app/src/services/technical.js';
import {stopsTechnicalMarkup,technicalAction} from '../../app/src/ui/technical.js';
import {overviewMarkup} from '../../app/src/ui/overview.js';
const stop={id:'stop',context:{machineId:'m'},startedAt:1000,endedAt:10000,reasonId:'reason'};
const repo={get:async path=>path==='stoppages/stop'?stop:{},create:async(path,row)=>row,timestamp:()=>11000};
const service=createTechnicalService({repo,actor:{uid:'engineer',role:'engineer'},clock:()=>11000,idFactory:()=> 'record'});
test('classification rejects repair times when failure is false',async()=>{
 await assert.rejects(service.classify({stopId:'stop',category:'performance',failure:false,repairStartedAt:2000,note:'Verificado'}),{code:'VALIDATION'});
 await assert.rejects(service.classify({stopId:'stop',category:'performance',failure:false,repairEndedAt:3000,note:'Verificado'}),{code:'VALIDATION'});
});
test('classification form preserves existing repair and allows open repair without inventing end time',async()=>{
 let markup,submit;
 await technicalAction('tech:classify:stop',{state:{context:stop.context,period:{effective:{stoppages:[stop]}},technical:[{id:'c',kind:'classification',stopId:'stop',createdAt:200,category:'performance',failure:true,repairStartedAt:2000,note:'Conferido'}]},services:{technical:service},showModal:(title,html,options)=>{markup=html;submit=options.submit;}});
 assert.match(markup,/value="performance" selected/);assert.match(markup,/name="failure" type="checkbox" checked/);
 assert.match(markup,/name="repairEndedAt"[^>]*value=""/);
 const data=new Map([['category','availability'],['failure','on'],['note','Conferido'],['repairStartedAt','1969-12-31T21:00:02'],['repairEndedAt','']]);
 const row=await submit(data);assert.equal(row.repairStartedAt,2000);assert.equal(row.repairEndedAt,undefined);
});
test('overview distinguishes approved pieces, first pass and recorded rework',()=>{
 const html=overviewMarkup({state:{dashboard:{totals:{goodPieces:344,reworkPieces:8}},asOf:10000},metrics:{aggregate:{firstPassGood:336,coverage:{}},reliability:{}},productivity:{aggregate:null},pending:{},renderers:{charts:()=>'',detail:()=>'',parameters:()=>'',queue:()=>''}});
 assert.match(html,/Total aprovado <strong>344/);assert.match(html,/Primeira passagem para OEE <strong>336/);assert.match(html,/Retrabalho registrado <strong>8/);
});
test('classification rejects invalid dates and preserves valid open repairs',async()=>{
 await assert.rejects(service.classify({stopId:'stop',category:'availability',failure:true,repairStartedAt:NaN,note:'Verificado'}));
 await assert.rejects(service.classify({stopId:'stop',category:'availability',failure:true,repairStartedAt:3000,repairEndedAt:2000,note:'Verificado'}),{code:'INVALID_TIME'});
 const row=await service.classify({stopId:'stop',category:'availability',failure:true,repairStartedAt:2000,note:'Verificado'});
 assert.equal(row.repairEndedAt,undefined);
});
test('stop classification displays newest classification and repair evidence independent of array order',()=>{
 const state={actor:{role:'engineer'},registries:{reasons:{reason:{name:'Ajuste'}}},period:{effective:{stoppages:[stop]}},technical:[{id:'new',kind:'classification',stopId:'stop',createdAt:200,category:'availability',failure:true,repairStartedAt:2000,repairEndedAt:5000,note:'Motor revisado'},{id:'old',kind:'classification',stopId:'stop',createdAt:100,category:'performance',failure:false,note:'Anterior'}]};
 const html=stopsTechnicalMarkup(state);
 assert.match(html,/Motor revisado/);assert.match(html,/Ajuste/);assert.match(html,/Reparo concluído/);assert.doesNotMatch(html,/Anterior/);
 assert.match(html,/tech:classify:stop/);
 assert.doesNotMatch(stopsTechnicalMarkup({...state,actor:{role:'operator'}}),/data-action="tech:classify/);
});
