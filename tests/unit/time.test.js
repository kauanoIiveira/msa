import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unionDuration,eventDate,validateDate} from '../../app/src/domain/time.js';
test('union avoids double counting and clips intervals to reporting period',()=>{
  assert.equal(unionDuration([{startedAt:0,endedAt:10},{startedAt:5,endedAt:15}],{from:0,to:20}).milliseconds,15);
  assert.equal(unionDuration([{startedAt:0,endedAt:10},{startedAt:5,endedAt:15}],{from:7,to:12}).milliseconds,5);
  assert.equal(unionDuration([{startedAt:0}],{from:0,to:20}).openCount,1);
  assert.equal(eventDate(Date.parse('2026-10-06T02:30:00Z')),'2026-10-05');
  assert.throws(()=>validateDate('2026-02-30'),{code:'INVALID_DATE'});
});
