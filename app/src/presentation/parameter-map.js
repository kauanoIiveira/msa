import {getMsaParameterCatalog} from '../catalog/msa-parameters.js';

// The workbook catalog is the authority for T20 names, units and unresolved limits.
// This map only assigns stable package IDs and a sample recipe to each catalog row.
export function presentationParameterMap(prefix) {
  const t20=getMsaParameterCatalog().map(row=>({
    catalogCode:row.code,parameterId:`${prefix}_parameter_${row.code}_1`,versionId:`${prefix}_version_${row.code}_1`,
    processId:'c26-selo',recipe:'selo-vgard-example',reference:row
  }));
  const nhpl=[
    {code:'NHPL_ASSEMBLY_CYCLE',name:'Tempo de ciclo de montagem',unit:'s',group:'cycle'},
    {code:'NHPL_INSPECTION_FORCE',name:'Força de inspeção',unit:'N',group:'quality'},
    {code:'NHPL_ALIGNMENT_OFFSET',name:'Offset de alinhamento · referência de exemplo',unit:'mm',group:'alignment',draftRule:{kind:'range',lower:-1,upper:1}}
  ].map(row=>({catalogCode:row.code,parameterId:`${prefix}_parameter_${row.code}_1`,versionId:`${prefix}_version_${row.code}_1`,
    processId:'nhpl-montagem',recipe:'nhpl-example',reference:{...row,draftRule:row.draftRule??{kind:'pending'},issues:['example-reference-only']}}));
  return {t20,nhpl};
}

export function exampleReading(item,index) {
  const row=item.reference,{lower,upper}=row.source?.limits??{};
  let value;
  if(row.code==='MSA_CH')value=-610-index%9;
  else if(row.group==='heating'&&lower===0&&upper===0)value=240+index%5;
  else if(row.code==='NHPL_ALIGNMENT_OFFSET')value=[-0.06,-0.03,0,0.04,0.06,0.03,-0.04][index%7];
  else if(Number.isFinite(lower)&&Number.isFinite(upper)&&lower<upper)value=(lower+upper)/2+(index%7-3)*(upper-lower)/50;
  else if(Number.isFinite(lower))value=lower+Math.abs(lower)*0.01+index%7/10;
  else value=row.code==='NHPL_ASSEMBLY_CYCLE'?42+(index%7)/10:120+(index%7);
  return {parameterId:item.parameterId,versionId:item.versionId,raw:String(Number(value.toFixed(3)))};
}

// Nominal example configuration only. T20 ambient/dimensional/utility readings
// and ambiguous heating/inverted ranges are not machine setup instructions.
export function presentationRecipeSettings(prefix,machine){
 const map=presentationParameterMap(prefix);
 if(machine==='nhpl')return Object.fromEntries(map.nhpl.map(item=>[item.catalogCode,{NHPL_ASSEMBLY_CYCLE:42,NHPL_INSPECTION_FORCE:120,NHPL_ALIGNMENT_OFFSET:0}[item.catalogCode]]));
 if(machine!=='t20')throw new Error('INVALID_EXAMPLE_MACHINE');
 return Object.fromEntries(map.t20.filter(({reference:r})=>['cycle','delay'].includes(r.group)&&Number.isFinite(r.source.limits.lower)&&Number.isFinite(r.source.limits.upper)&&r.source.limits.lower<r.source.limits.upper).map(({catalogCode,reference:r})=>[catalogCode,(r.source.limits.lower+r.source.limits.upper)/2]));
}
