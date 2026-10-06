import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyDashboard,
  workspaceId,
} from "../../app/src/ui/operational-workspace.js";
test("operational workspace is separate from fixtures and has no invented readings or KPIs", () => {
  assert.equal(workspaceId, "msa");
  const dashboard = emptyDashboard();
  assert.equal(dashboard.parameters.length, 41);
  for (const p of dashboard.parameters) {
    assert.equal(p.latest, null);
    assert.equal(p.state, "not-configured");
    assert.deepEqual(p.statistics, []);
  }
  assert.equal(dashboard.totals.grossPieces, null);
  assert.equal(dashboard.totals.rejectPercent, null);
  assert.deepEqual(dashboard.series, []);
  assert.deepEqual(dashboard.alerts, []);
});
