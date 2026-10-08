import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeShift,shiftAt,shiftWindows,classifyRecord,assertShiftPeriod} from '../../app/src/domain/shifts.js';
const t=s=>Date.parse('2026-10-08T'+s+'-03:00');
test('São Paulo shift boundaries and operational date do not depend on host zone',()=>{
 assert.equal(shiftAt(t('07:00:00')).shift,'1');assert.equal(shiftAt(t('15:00:00')).shift,'2');assert.equal(shiftAt(t('23:00:00')).shift,'3');
 assert.equal(shiftAt(Date.parse('2026-10-09T06:59:59-03:00')).operationalDate,'2026-10-08');
 assert.equal(normalizeShift('2º turno'),'2');assert.equal(normalizeShift('all'),null);
 const w=shiftWindows('2026-10-08','2026-10-10','1');assert.equal(w.length,3);assert.equal(w[0].to,t('15:00:00'));
 assert.equal(shiftWindows('2026-10-08','2026-10-08','3')[0].to,Date.parse('2026-10-09T07:00:00-03:00'));
 assert.throws(()=>shiftWindows('2026-02-30','2026-03-01','1'));
});
test('legacy quantities remain unallocated instead of being split or relabeled',()=>{
 const row={context:{shift:'2'},startedAt:t('13:00:00'),endedAt:t('14:00:00'),quantity:25};const original=structuredClone(row),w=shiftWindows('2026-10-08','2026-10-08','1');
 assert.ok(classifyRecord('production',row,w).diagnostics.includes('shift-conflict'));assert.deepEqual(row,original);
 assert.equal(classifyRecord('production',{...row,context:{shift:'1'},endedAt:t('16:00:00')},w).allocated,false);
 assert.ok(classifyRecord('collections',{createdAt:t('08:00:00')},w).diagnostics.includes('time-required'));
 assertShiftPeriod({shift:'1'},t('14:59:00'),t('15:00:00'));assert.throws(()=>assertShiftPeriod({shift:'1'},t('14:59:00'),t('15:01:00')));
});
