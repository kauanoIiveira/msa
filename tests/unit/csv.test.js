import {test} from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {createCsvService} from '../../app/src/io/csv.js';
import {memoryRepository} from '../helpers/memory-repository.js';
import {createOperations} from '../../app/src/services/operations.js';
import {seed} from '../helpers/fixtures.js';
test('CSV preview parses quoted decimal fields, preserves date-only precision, and needs explicit confirmation',async()=>{
  const repo=memoryRepository(),f=await seed(repo),operations=createOperations({repo,actor:{uid:'op',role:'operator'}}),csv=createCsvService({papa:Papa,repo,operations});
  const opts={source:{file:'synthetic.csv'},context:f.context,parameterMap:{Vacuum:{parameterId:f.parameterId,versionId:f.versionId,unit:'mmHg'}}};
  const preview=await csv.previewImport('\uFEFFdate;parameter;raw;unit\r\n2026-08-31;Vacuum;"-600";mmHg',opts);
  assert.equal(preview.records.length,1);assert.equal(preview.records[0].payload.occurredAt,undefined);assert.equal(await repo.get('collections'),null);
  await assert.rejects(()=>csv.confirmImport(preview,{}),{code:'CONFIRMATION_REQUIRED'});
  const first=await csv.confirmImport(preview,{confirmed:true});assert.equal(first.created,1);
  const second=await csv.confirmImport(preview,{confirmed:true});assert.equal(second.existing,1);
  const changed=await csv.previewImport('date;parameter;raw;unit\n2026-08-31;Vacuum;-550;mmHg',opts);
  await assert.rejects(()=>csv.confirmImport(changed,{confirmed:true}),{code:'IMPORT_CONFLICT'});
  const tampered=structuredClone(preview);tampered.records[0].payload.readings[0].raw='-500';
  await assert.rejects(()=>csv.confirmImport(tampered,{confirmed:true}),{code:'PREVIEW_CHANGED'});
  const invalid=await csv.previewImport('date;parameter;raw\n2026-02-30;Vacuum;0,8',opts);assert.ok(invalid.errors.length);
});
test('CSV export neutralizes text formulas without changing numeric vacuum or quoted newlines',()=>{
  const csv=createCsvService({papa:Papa});
  const exported=csv.exportRecords([{raw:'=HYPERLINK("bad")',value:-600,unit:'mmHg',note:'line 1\nline "2"'}],['raw','value','unit','note']);
  const parsed=Papa.parse(exported,{header:true,delimiter:';',skipEmptyLines:true});
  assert.equal(parsed.data[0].value,'-600');assert.ok(parsed.data[0].raw.startsWith("'="));assert.equal(parsed.data[0].note,'line 1\nline "2"');
});
