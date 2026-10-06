import { getMsaParameterCatalog } from "../catalog/msa-parameters.js";
export const workspaceId = "msa";
export function emptyDashboard() {
  return {
    totals: {
      grossPieces: null,
      goodPieces: null,
      rejectedPieces: null,
      stopMinutes: null,
      openStoppages: null,
      rejectPercent: null,
      lossKg: null,
    },
    parameters: getMsaParameterCatalog().map((p) => ({
      ...p,
      parameterIds: [],
      configurationState: "not-configured",
      state: "not-configured",
      latest: null,
      statistics: [],
      observationCount: 0,
    })),
    series: [],
    statistics: [],
    alerts: [],
    reasonRanking: { stopMinutes: [] },
    complete: false,
    notes: [],
  };
}
