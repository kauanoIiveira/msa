import {date,escapeHtml as e} from './format.js';
export function parameterReferences(registries,parameterId){
 const versions=Object.values(registries.parameterVersions??{}).filter(v=>v.parameterId===parameterId).sort((a,b)=>(b.createdAt??0)-(a.createdAt??0)||b.id.localeCompare(a.id));
 return {versions,latest:versions[0]??null,approved:versions.find(v=>v.status==='approved')??null};
}
export function availableProductionIntervals(state){return Object.entries(state.period.intervalHeaders??{}).filter(([id,h])=>!state.period.closures?.[id]&&!state.period.retiredIntervals?.includes(id)&&Object.entries(state.context).every(([k,v])=>!v||h.context?.[k]===v)).sort(([,a],[,b])=>a.startedAt-b.startedAt);}
export function productionChartData(view){
 const segments=view.segments.filter(s=>Number.isFinite(s.from)&&Number.isFinite(s.to)).slice().sort((a,b)=>a.from-b.from||a.to-b.to);
 const planned=segments.map(s=>Number.isFinite(s.plannedPieces)?s.plannedPieces:null);
 const gross=segments.map(s=>(['final','partial'].includes(s.state)||s.reason==='confirmation-required')&&Number.isFinite(s.grossPieces)?s.grossPieces:null);
 // An unknown interval interrupts the cumulative series; it is not a zero.
 const cumulative=values=>{let total=0,complete=true;return values.map(value=>{complete=complete&&value!=null;if(!complete)return null;return total+=value;});};
 return {segments,labels:segments.map(s=>date(s.from,true)+' – '+date(s.to,true)),fullLabels:segments.map(s=>date(s.from,true)+' – '+date(s.to,true)+' · OP '+(s.context?.order??'')+' · lote '+(s.context?.lot??'')+' · turno '+(s.context?.shift??'')),planned,gross,minimum:segments.map(s=>s.minimumPieces??null),accumulatedPlanned:cumulative(planned),accumulatedGross:cumulative(gross)};
}
export function referenceDraft(parameterId,version){
 if(!version||version.parameterId!==parameterId)return {parameterId};
 return {parameterId,unit:version.unit,nature:version.nature,status:'draft',rule:structuredClone(version.rule)};
}
export function recordContextMarkup(record,registries){
 const c=record.context??{};
 const parts=[registries.machines?.[c.machineId]?.name,registries.processes?.[c.processId]?.name,registries.products?.[c.productId]?.name,c.variant,c.order&&'OP '+c.order,c.lot&&'Lote '+c.lot,c.shift&&'Turno '+c.shift].filter(Boolean);
 return `<div class="small muted record-context">${e(parts.join(' · '))}</div>`;
}
