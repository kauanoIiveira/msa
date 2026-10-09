import {test} from 'node:test';
import assert from 'node:assert/strict';
test('UI escapes external text and preserves missing values and numeric zero',async()=>{
  const ui=await import('../../app/src/ui/format.js');
  assert.equal(ui.escapeHtml('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
  assert.equal(ui.number(null),'Sem dados');assert.equal(ui.number(0),'0');
  assert.equal(ui.number(0.8),'0,8');assert.equal(ui.number(-600),'-600');
});
test('calendar filters produce an exclusive next-day range and do not silently replace invalid dates',async()=>{
  const ui=await import('../../app/src/ui/format.js');
  const r=ui.dateWindow('2026-10-05','2026-10-05');
  assert.equal(r.from,Date.parse('2026-10-05T03:00:00Z'));assert.equal(r.to-r.from,86400000);
  assert.throws(()=>ui.dateWindow('2026-02-30','2026-03-01'));
  assert.throws(()=>ui.dateWindow('2026-10-06','2026-10-05'));
});
