import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectProduction,changeRecordingProduction} from '../../app/src/ui/production-selection.js';
const row={id:'case1',machineId:'m',processId:'p',productId:'vgard',order:'OP-1',lot:'LT-1',shift:'1'};
test('choosing a production does not change broad consultation filters',()=>{
 const selection={query:{context:{productId:'mark'},fromDate:'2026-10-01',toDate:'2026-10-07',shift:'all'},recording:null};
 const next=selectProduction(selection,row);assert.deepEqual(next.query,selection.query);assert.equal(next.recording.context.productId,'vgard');assert.equal(selection.recording,null);
});
test('switching production with a draft asks for a decision and never silently rewrites it',()=>{
 const selection=selectProduction({query:{context:{}},recording:null},row);
 const draft={context:selection.recording.context,raw:'10,5'};
 const result=changeRecordingProduction({selection,nextCase:{...row,id:'case2',productId:'mark'},draft});
 assert.equal(result.requiresDecision,true);assert.equal(result.selection.recording.context.productId,'vgard');assert.deepEqual(result.draft,draft);
 const changed=changeRecordingProduction({selection,nextCase:{...row,id:'case2',productId:'mark'},draft,decision:'new'});
 assert.equal(changed.selection.recording.context.productId,'mark');assert.equal(changed.draft,null);
});
