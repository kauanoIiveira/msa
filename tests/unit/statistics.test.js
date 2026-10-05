import {test} from 'node:test';
import assert from 'node:assert/strict';
import {summarizeReadings} from '../../app/src/domain/statistics.js';
import {parseReading} from '../../app/src/domain/numbers.js';
const rule={kind:'range',lower:0.8,upper:0.9};
test('BF regression includes numeric strings and data following missing readings', () => {
  const readings=[parseReading(null),...Array(7).fill('0,8').map(parseReading),...Array(10).fill(0.9).map(parseReading)];
  const r=summarizeReadings(readings,{sigmaMethod:'population',rule});
  for(const [key,want] of Object.entries({mean:0.8588235294117647,sigma:0.04921529567847503,cp:0.3386481059780782,cpk:0.2788866755113585})) assert.ok(Math.abs(r[key]-want)<1e-10,key);
  assert.equal(r.nValid,17); assert.equal(r.nMissing,1); assert.equal(r.homologated,false);
});
test('constant and insufficient samples never return infinite capability', () => {
  for(const data of [[],[0.9],Array(17).fill(0.9)]) {
    const r=summarizeReadings(data.map(parseReading),{sigmaMethod:'population',rule});
    assert.equal(r.cp,null); assert.equal(r.cpk,null); assert.ok(r.reason);
  }
  assert.equal(summarizeReadings([1,2,3].map(parseReading),{sigmaMethod:'sample',rule:{kind:'range',lower:0,upper:4}}).sigma,1);
});
