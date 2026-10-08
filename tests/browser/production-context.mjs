/** Manual CUA runbook. This module records checks; it does not claim to automate a browser. */
export const productionContextRunbook = {
  surface:'CUA in-app browser; own tab at http://127.0.0.1:5180/msa/',
  precautions:'Use the authenticated session normally. Do not inspect tokens or mutate browser state with evaluate. Wait for the real published manifest. Controller authorizes and performs cloud recording QA.',
  focal:[
    'Open dashboard after authentication settles: Registrar em shows product, OP, lot, shift, recipe; Consultar shows the persisted completed dates.',
    'Choose production: filter by a registered machine, search a product/OP, inspect the third shift. Operational date remains the date the shift began while 03–07 belongs to the next calendar day.',
    'Consult both NHPL products with Apply filters, select one production, open Nova coleta: only its process parameters appear and context is inherited without OP retyping.',
    'Type a reading and close with Escape; resume draft. Choose another production: Keep preserves text/context, New explicitly discards draft and changes only recording selection.',
    'Record an explicit historical measurement only when authorized by controller, confirm ACK, inspect created ID, use Ver no resumo and Ver no histórico. Reload and compare same Firebase ID.',
    'Interrupt network only through supported visible browser controls if available; submission stays unconfirmed with values intact. Retry uses the same intent ID, changed content conflicts instead of duplicating.',
    'Equipment shows registered status, process and last measurement in the consulted period, never a physical connectivity claim. Sector filter exists only for cataloged sectors.',
    'Viewer has no collection/write actions; service tests reject writes. Empty machine/period, rejected form and stale session retain useful feedback.'
  ],
  finalGate:[
    'Viewports 1440×900, 1280×720, 1024×580, 390×844, 320×568: page without horizontal overflow; tables may scroll internally. Capture desktop and mobile.',
    'Keyboard Tab, Enter, Escape and focus return; light/dark/system themes.',
    'Settings > Verificação técnica preserves 17 isolated scenarios and restores query/recording/draft on returning. Old route aliases, charts and TV remain available.'
  ],
  evidence:'Controller reported CUA tab 5 dashboard 90% productivity / 70% OEE / 230 min MTBF / 8 min MTTR / 360 gross / 344 good / 16 rejects, four complete bases; inherited three-parameter NHPL form. Further cloud-write and five-viewport evidence belongs to the final gate.'
};
