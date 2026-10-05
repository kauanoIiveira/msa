import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseReading} from '../../app/src/domain/numbers.js';

test('preserves zero, signed vacuum and unambiguous decimal inputs', () => {
  for (const [raw, value] of [['0,8', 0.8], ['0.8', 0.8], ['-600', -600], [0, 0]]) {
    assert.equal(parseReading(raw).value, value);
    assert.equal(parseReading(raw).status, 'valid');
  }
});
test('distinguishes absent from invalid instead of coercing to zero', () => {
  for (const raw of ['', null, undefined, '  ']) assert.equal(parseReading(raw).status, 'missing');
  for (const raw of ['1.234,56', 'NaN', Infinity, '6,6 bar', true, {}, '1e3']) {
    assert.equal(parseReading(raw).status, 'invalid');
    assert.equal(parseReading(raw).value, undefined);
  }
});
