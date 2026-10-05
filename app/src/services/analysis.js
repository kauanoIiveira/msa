import {assertRole,assertId,knownKeys,requireThat} from '../domain/errors.js';
import {nextReviewState,validateReplacement,normalizeCorrection} from '../domain/review.js';
const text=(value,field)=>requireThat(typeof value==='string'&&value.trim().length>0&&value.length<=2000,'VALIDATION',field);
const typeNames={production:'production',collections:'collections',collection:'collections',losses:'losses',loss:'losses',stoppages:'stoppages',stoppage:'stoppages'};
export function createAnalysisService({repo,actor,idFactory=()=>crypto.randomUUID()}) {
  const event=(state,justification)=>({state,by:actor.uid,at:repo.timestamp(),...(justification?{justification}:{})});
  return {
    async submitReview(payload) {
      assertRole(actor,['admin','operator','engineer']);knownKeys(payload,['collectionId','scope']);assertId(payload.collectionId);text(payload.scope,'scope');
      const col=await repo.get(`collections/${payload.collectionId}`);requireThat(col,'NOT_FOUND');
      const id=assertId(idFactory());return repo.create(`reviews/${id}`,{id,collectionId:payload.collectionId,scope:payload.scope,state:'waiting',eventDate:col.eventDate,createdBy:actor.uid,createdAt:repo.timestamp(),history:{0:event('waiting')}});
    },
    async startReview(id) {
      assertRole(actor,['admin','engineer']);return repo.transact(`reviews/${assertId(id)}`,current=>{
        requireThat(current,'NOT_FOUND');const state=nextReviewState(current.state,'start',actor.role);
        return {...current,state,history:{...current.history,1:event(state)}};
      });
    },
    async decideReview(id,payload) {
      assertRole(actor,['admin','engineer']);knownKeys(payload,['decision','justification']);text(payload.justification,'justification');
      return repo.transact(`reviews/${assertId(id)}`,current=>{
        requireThat(current,'NOT_FOUND');const state=nextReviewState(current.state,payload.decision,actor.role);
        return {...current,state,history:{...current.history,2:event(state,payload.justification)}};
      });
    },
    async requestCorrection(payload) {
      assertRole(actor,['admin','operator','engineer']);knownKeys(payload,['recordType','recordId','replacement','reason']);text(payload.reason,'reason');
      const type=typeNames[payload.recordType];requireThat(type,'INVALID_KIND');assertId(payload.recordId);
      const original=await repo.get(`${type}/${payload.recordId}`);requireThat(original,'NOT_FOUND');
      const replacement=validateReplacement(type,original,payload.replacement),id=assertId(idFactory());
      if(replacement.reasonId) {
        const reason=await repo.get(`reasons/${assertId(replacement.reasonId)}`);requireThat(reason?.kind===(type==='stoppages'?'stop':replacement.kind),'INVALID_REFERENCE');
      }
      const storedReplacement=type==='collections'?{...replacement,readings:Object.values(replacement.readings)}:replacement;
      return normalizeCorrection(await repo.create(`corrections/${id}`,{id,recordType:type,recordId:payload.recordId,replacement:storedReplacement,reason:payload.reason,state:'waiting',eventDate:original.eventDate,createdBy:actor.uid,createdAt:repo.timestamp()}));
    },
    async decideCorrection(id,payload) {
      assertRole(actor,['admin','engineer']);knownKeys(payload,['decision','justification']);text(payload.justification,'justification');requireThat(['approved','rejected'].includes(payload.decision),'INVALID_TRANSITION');
      const request=normalizeCorrection(await repo.get(`corrections/${assertId(id)}`));requireThat(request,'NOT_FOUND');
      const original=await repo.get(`${request.recordType}/${request.recordId}`);validateReplacement(request.recordType,original,request.replacement);
      return normalizeCorrection(await repo.transact(`corrections/${id}`,current=>{
        requireThat(current,'NOT_FOUND');requireThat(current.state==='waiting','INVALID_TRANSITION');requireThat(current.createdBy!==actor.uid,'SELF_APPROVAL');
        return {...current,state:payload.decision,decision:{state:payload.decision,by:actor.uid,at:repo.timestamp(),justification:payload.justification}};
      }));
    }
  };
}
