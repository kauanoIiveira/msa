import {buildBiFacts} from './bi-model.js';
const kinds=['collections','production','losses','stoppages','indicators'];
function cell(value){
 if(value==null)return '';
 if(typeof value==='number'){if(!Number.isFinite(value))return '';return String(value).replace('.',',');}
 let text=typeof value==='object'?JSON.stringify(value):String(value);
 if(/^[\s]*[=+\-@]/.test(text))text="'"+text;
 return /[;"\r\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;
}
export function exportBi({view,kind='all',locale='pt-BR'}){
 if(locale!=='pt-BR')throw new Error('Localidade BI não suportada.');
 const period=view.period??view;if(period.complete!==true||Object.values(period.coverage??{}).some(v=>v===false)||period.nhplComplete===false)throw new Error('Consulta incompleta. Reduza o período ou atualize antes de exportar; nenhum registro será truncado.');
 if(kind!=='all'&&!kinds.includes(kind))throw new Error('Formato BI inválido.');
 const facts=buildBiFacts(view),selected=kind==='all'?kinds:[kind],files=[];
 for(const name of selected){const rows=facts[name],columns=[...new Set(rows.flatMap(Object.keys))];const text='\ufeff'+[columns.map(cell).join(';'),...rows.map(row=>columns.map(k=>cell(row[k])).join(';'))].join('\r\n')+'\r\n';if(text.length>50000000)throw new Error('Arquivo acima de 50 milhões de caracteres. Reduza o período; nenhum registro foi truncado.');files.push({name:'msa-bi-'+name+'.csv',mime:'text/csv;charset=utf-8',text});}
 return {files,manifest:{schemaVersion:1,locale,query:view.operationalQuery?.consultation??null,counts:Object.fromEntries(kinds.map(k=>[k,facts[k].length]))},diagnostics:facts.diagnostics};
}
