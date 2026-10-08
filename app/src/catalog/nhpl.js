export const nhplCatalog=Object.freeze({id:'nhpl',machineId:'nhpl',processId:'nhpl-montagem',productIds:['nhpl-vgard-hp','nhpl-mark-v'],line:'Montagem',variants:['Low','Medium','High'],source:'Respostas de Fabiana — 07/10/2026'});
export const nhplItems=[
 {kind:'machines',id:'nhpl',payload:{name:'NHPL · Montagem de abafadores',code:'NHPL'}},
 {kind:'processes',id:'nhpl-montagem',payload:{name:'Processo de montagem do abafador',machineId:'nhpl'}},
 {kind:'products',id:'nhpl-vgard-hp',payload:{name:'Abafadores VGARD HP',processIds:{'nhpl-montagem':true}}},
 {kind:'products',id:'nhpl-mark-v',payload:{name:'Abafadores MARK V',processIds:{'nhpl-montagem':true}}},
];
