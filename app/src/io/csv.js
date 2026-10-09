import {requireThat,MsaError,knownKeys} from '../domain/errors.js';
import {stableStringify} from '../domain/canonical.js';
import {validateDate} from '../domain/time.js';
import {parseReading} from '../domain/numbers.js';
async function hash(value) {
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stableStringify(value)));
  return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function stableImportId({source,row,context}) {return 'imp_'+await hash({source,row,context});}
const expectedRecord=(payload)=>({...payload,readings:Object.fromEntries(payload.readings.map(r=>[r.parameterId,{parameterId:r.parameterId,versionId:r.versionId,...parseReading(r.raw)}]))});
const withoutAudit=record=>{const {createdAt,createdBy,...data}=record;return data;};
export function createCsvService({papa,operations,repo}) {
  return {
    async previewImport(text,{source,context,parameterMap}) {
      requireThat(typeof text==='string'&&text.length<=5_000_000,'CSV_TOO_LARGE');
      knownKeys(source,['file','sheet']);requireThat(typeof source.file==='string'&&source.file.length>0,'INVALID_SOURCE');
      const parsed=papa.parse(text,{header:true,delimiter:';',skipEmptyLines:'greedy',transformHeader:header=>header.trim()});
      const errors=parsed.errors.map(e=>({row:e.row==null?null:e.row+2,code:e.code,message:e.message})),warnings=[],records=[];
      requireThat(parsed.data.length<=10000,'CSV_TOO_LARGE');
      for(const header of ['date','parameter','raw']) if(!parsed.meta.fields?.includes(header)) errors.push({row:1,code:'MISSING_HEADER',field:header});
      if(!errors.length) for(const [index,row] of parsed.data.entries()) {
        try {
          const mapping=parameterMap[row.parameter];requireThat(mapping,'UNMAPPED_PARAMETER','parameter');validateDate(row.date);
          if(row.unit) requireThat(mapping.unit&&row.unit===mapping.unit,'INVALID_UNIT','unit');
          const reading=parseReading(row.raw);if(reading.status!=='valid') warnings.push({row:index+2,code:reading.status.toUpperCase()});
          const evidence={...source,row:index+2,cells:parsed.meta.fields.join(',')};
          const id=await stableImportId({source,row:index+2,context});
          const payload={id,context:structuredClone(context),origin:'import',timePrecision:'date',eventDate:row.date,source:evidence,readings:[{parameterId:mapping.parameterId,versionId:mapping.versionId,raw:row.raw}]};
          records.push({id,payload});
        } catch(e) {errors.push({row:index+2,code:e.code??'INVALID_ROW',field:e.field??null});}
      }
      const preview={records,errors,warnings};return {...preview,fingerprint:await hash(preview)};
    },
    async confirmImport(preview,{confirmed}={}) {
      requireThat(confirmed===true,'CONFIRMATION_REQUIRED');const snapshot=structuredClone(preview);
      const {fingerprint,...content}=snapshot;requireThat(await hash(content)===fingerprint,'PREVIEW_CHANGED');
      requireThat(!content.errors.length&&content.records.length>0,'IMPORT_INVALID');
      let created=0,existing=0;
      for(const {id,payload} of content.records) {
        const matches=record=>record&&stableStringify(withoutAudit(record))===stableStringify(expectedRecord(payload));
        const old=await repo.get(`collections/${id}`);
        if(old) {requireThat(matches(old),'IMPORT_CONFLICT');existing++;continue;}
        try {await operations.recordCollection(payload);created++;}
        catch(e) {
          if(!['CONFLICT','RECORD_CONFLICT'].includes(e.code)) throw e;
          const raced=await repo.get(`collections/${id}`);if(!matches(raced)) throw new MsaError('IMPORT_CONFLICT');existing++;
        }
      }
      return {created,existing,total:created+existing};
    },
    exportRecords(rows,columns) {
      requireThat(Array.isArray(rows)&&Array.isArray(columns)&&columns.length>0,'INVALID_EXPORT');
      const descriptors=columns.map(c=>typeof c==='string'?{key:c,label:c}:c);
      for(const c of descriptors) requireThat(typeof c.key==='string'&&c.key.split('.').every(part=>/^[A-Za-z0-9_-]+$/.test(part)&&!['__proto__','prototype','constructor'].includes(part)),'INVALID_EXPORT');
      const data=rows.map(row=>descriptors.map(c=>{
        const value=c.key.split('.').reduce((obj,key)=>obj?.[key],row);
        return value==null?'':typeof value==='object'?JSON.stringify(value):value;
      }));
      return '\uFEFF'+papa.unparse({fields:descriptors.map(c=>c.label??c.key),data},{delimiter:';',newline:'\r\n',escapeFormulae:true});
    }
  };
}
