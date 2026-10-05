import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateRule,evaluateReading} from '../../app/src/domain/limits.js';
import {parseReading} from '../../app/src/domain/numbers.js';
test('rejects inverted and ambiguous zero-zero limits', () => {
  for (const rule of [{kind:'range',lower:80,upper:75},{kind:'range',lower:0,upper:0}]) {
    assert.throws(() => validateRule(rule), {code:'INVALID_LIMIT'});
  }
  assert.equal(validateRule({kind:'pending'}).kind, 'pending');
});
test('uses declared signed inequality and never approves draft or missing', () => {
  const version={status:'approved',rule:{kind:'upper',upper:-600}};
  assert.equal(evaluateReading(parseReading('-650'),version).state,'within');
  assert.equal(evaluateReading(parseReading('-550'),version).state,'outside');
  assert.equal(evaluateReading(parseReading('-650'),{...version,status:'draft'}).state,'pending');
  assert.equal(evaluateReading(parseReading(null),version).state,'missing');
});
