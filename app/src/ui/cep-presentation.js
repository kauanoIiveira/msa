import {analyzeCep} from '../domain/cep.js';
import {getMsaParameterCatalog} from '../catalog/msa-parameters.js';
import {date} from './format.js';

// Separate local teaching observations; never append to a collection or workbook.
export function presentationCepStudy(original,state){
  const reference=getMsaParameterCatalog().find(p=>p.code===original.parameter?.code);
  const unit=original.unit??reference?.unit??'unidade didática';
  const candidate=original.version?.unit===unit?original.version.rule:reference?.draftRule;
  const bilateral=candidate?.kind==='range'&&Number.isFinite(candidate.lower)&&Number.isFinite(candidate.upper)&&candidate.upper>candidate.lower;
  const baseline=Number.isFinite(original.analysis.mean)?original.analysis.mean:0;
  const margin=Math.max(Math.abs(baseline)*.1,1);
  const rule=bilateral?{...candidate}:{kind:'range',lower:baseline-margin,upper:baseline+margin};
  const center=rule.lower+(rule.upper-rule.lower)/2,spread=(rule.upper-rule.lower)*.08;
  const variation=[-1,1,-.5,.5,-.8,.8,-.2,.2,-.6,.6];
  const first=Date.parse(`${state.fromDate??'2026-10-01'}T08:00:00-03:00`);
  const count=Math.max(30,original.analysis.minSamples);
  const samples=Array.from({length:count},(_,i)=>{
    const value=center+variation[i%variation.length]*spread,occurredAt=first+i*60000;
    return {value,raw:String(value),status:'valid',origin:'demo',source:'cep-presentation',occurredAt,timePrecision:'instant',eventDate:new Date(occurredAt).toISOString().slice(0,10),label:`Exemplo ${i+1} · ${date(occurredAt,true)}`};
  });
  const version={id:'cep-presentation-reference',unit,rule,nature:'measurement',status:'approved'};
  const analysis=analyzeCep(samples,{version,minSamples:count,context:state.context,sequenceConfirmed:true,complete:true,sourceUnit:unit});
  return {...original,parameter:original.parameter??{name:'Característica de exemplo'},group:null,samples,version,unit,analysis,timed:true,sequenceConfirmed:true,
    presentationExample:true,originalStudy:original,referenceDescription:bilateral?'Faixa da referência usada somente para demonstração':'Faixa ilustrativa criada para demonstração',
    source:`Exemplo de apresentação · ${original.fromWorkbook?'baseado na característica da planilha':'característica dos registros do sistema'} · observações sintéticas locais`};
}
