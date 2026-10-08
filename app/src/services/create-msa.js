import {createRegistryService} from './registry.js';
import {createOperations} from './operations.js';
import {createAnalysisService} from './analysis.js';
import {createHistoryService} from './history.js';
import {createCsvService} from '../io/csv.js';
import {buildIndicators} from '../domain/indicators.js';
import {assertId,requireThat} from '../domain/errors.js';
import {createCatalogService} from './catalog.js';
import {buildDashboard} from '../domain/dashboard.js';
import {assertPeriod,eventDate} from '../domain/time.js';
import {createNhplService} from './nhpl.js';
import {createProductionPolicyService} from './production-policy.js';
import {createPlanningService} from './planning.js';
import {createPlannedProductionService} from './planned-production.js';
import {buildProductivity} from '../domain/productivity.js';
import {createMachineRunService} from './machine-runs.js';
import {createTechnicalService} from './technical.js';
import {createProductionCaseService} from './production-case.js';
export function createMsaServices(options) {
  const history=createHistoryService(options),operations=createOperations(options);
  const plannedProduction=createPlannedProductionService(options),analysis=createAnalysisService(options);
  const requestCorrection=analysis.requestCorrection.bind(analysis),decideCorrection=analysis.decideCorrection.bind(analysis);
  analysis.requestCorrection=payload=>payload.intervalId?plannedProduction.requestCorrection(payload):requestCorrection(payload);
  analysis.decideCorrection=async(id,payload)=>{let row;try{row=await options.repo.get('plannedCorrections/'+id);}catch(error){if(error.code!=='FORBIDDEN')throw error;}return row?plannedProduction.decideCorrection(id,payload):decideCorrection(id,payload);};
  return {
    registry:createRegistryService(options),catalog:createCatalogService(options),operations,analysis,history,
    productions:createProductionCaseService(options),
    technical:createTechnicalService({...options,operations,plannedProduction}),
    nhpl:createNhplService(options),policies:createProductionPolicyService(options),planning:createPlanningService(options),plannedProduction,runs:createMachineRunService(options),
    csv:createCsvService({...options,operations}),
    async getProductivity(query,range,config={}) {
      assertPeriod(range?.from,range?.to);const data=await history.loadPeriod(query);
      return buildProductivity({...data,production:data.effective.production,losses:data.effective.losses},{...range,now:(options.clock??Date.now)(),...config,context:query.context,coverage:{complete:data.nhplComplete&&data.coverage.production&&data.coverage.corrections}});
    },
    async getIndicators(query,range) {
      const period=await history.loadPeriod(query);
      const indicators=buildIndicators({...period,...period.effective},{...range,complete:period.complete});
      return {...indicators,notes:[...period.notes,...indicators.notes]};
    },
    async getDashboard(query,range) {
      assertPeriod(range?.from,range?.to);
      requireThat(query?.fromDate===eventDate(range.from)&&query?.toDate===eventDate(range.to-1),'INVALID_PERIOD');
      for(const field of ['machineId','processId','productId']) assertId(query.context?.[field],field);
      const period=await history.loadPeriod(query),parameters=await options.repo.get('parameters')??{};
      const view=buildDashboard({...period,...period.effective,parameters},{...range,context:query.context,complete:period.complete});
      return {...view,notes:[...new Set([...period.notes,...view.notes])]};
    }
  };
}
export function createAuthenticatedMsa({authService,repositoryFactory,...options}) {
  let user=null,actor=null,workspaceId=null,activeRepository=null,generation=0,disposed=false;
  const observers=new Set(),listeners=new Set();
  const notify=()=>{for(const callback of observers) callback({user,actor,workspaceId});};
  const revoke=()=>{generation++;for(const off of listeners) off();listeners.clear();actor=null;workspaceId=null;activeRepository=null;};
  const offAuth=authService.watchSession(next=>{
    if(disposed) return;
    if(next?.uid!==user?.uid) revoke();user=next;notify();
  },error=>{revoke();user=null;notify();for(const observer of observers) observer({user:null,actor:null,workspaceId:null,error});});
  return {
    repository(){requireThat(!disposed&&activeRepository,'STALE_SESSION');return activeRepository;},
    watchSession(callback) {requireThat(!disposed,'STALE_SESSION');observers.add(callback);callback({user,actor,workspaceId});return()=>observers.delete(callback);},
    async onWorkspace(id) {
      requireThat(!disposed,'STALE_SESSION');requireThat(user?.uid,'AUTH_REQUIRED');assertId(id);revoke();const epoch=generation,uid=user.uid;
      const check=()=>requireThat(!disposed&&epoch===generation&&user?.uid===uid,'STALE_SESSION');
      const raw=repositoryFactory(id),member=await raw.get(`members/${uid}`);check();
      requireThat(['admin','operator','engineer','viewer'].includes(member?.role),'FORBIDDEN');actor={uid,role:member.role};workspaceId=id;
      const wrapRepo=new Proxy(raw,{get(target,key){
        const value=target[key];if(typeof value!=='function') return value;
        if(key==='watch'||key==='watchConnection') return (...args)=>{
          check();let off;
          if(key==='watch') {
            const [path,q,onNext,onError]=args;
            off=value.call(target,path,q,v=>{if(epoch===generation&&!disposed) onNext(v);},e=>{if(epoch===generation&&!disposed) onError?.(e);});
          } else off=value.call(target,v=>{if(epoch===generation&&!disposed) args[0](v);});
          const cancel=()=>{off();listeners.delete(cancel);};listeners.add(cancel);return cancel;
        };
        if(key==='timestamp') return ()=>{check();return value.call(target);};
        return async (...args)=>{check();const result=await value.apply(target,args);check();return result;};
      }});
      const memberOff=raw.watch(`members/${uid}`,null,next=>{
        if(epoch!==generation||disposed) return;
        if(next?.role!==member.role) {revoke();notify();}
      },()=>{if(epoch===generation) {revoke();notify();}});listeners.add(memberOff);
      const services=createMsaServices({...options,repo:wrapRepo,actor});
      const wrap=value=>typeof value==='function'?async (...args)=>{check();const result=await value(...args);check();return result;}:Object.fromEntries(Object.entries(value).map(([key,child])=>[key,typeof child==='function'?async (...args)=>{check();const result=await child.apply(value,args);check();return result;}:child]));
      const secured=Object.fromEntries(Object.entries(services).map(([key,value])=>[key,wrap(value)]));
      // Listener APIs must return cancellation synchronously, unlike write/read promises.
      secured.history.watch=(...args)=>{check();return services.history.watch(...args);};
      activeRepository=wrapRepo;
      notify();return secured;
    },
    dispose() {if(disposed) return;disposed=true;revoke();offAuth();observers.clear();}
  };
}
