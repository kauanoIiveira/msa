// Deterministic, local generation only. Publication is a separate operation.
await import('../firebase/rules-source.mjs');
await import('./nhpl-rules.mjs');
await import('./technical-rules.mjs');
await import('./production-case-rules.mjs');
await import('./coverage-rules.mjs');
