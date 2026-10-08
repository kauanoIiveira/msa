import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as page from '../../app/src/ui/parameters-page.js';
test('initial render, search and clearing retain only applicable or observed parameters',()=>{
 const state={search:'',dashboard:{parameters:[{name:'Pressão vinculada',parameterIds:['p'],observationCount:0},{name:'Leitura histórica',parameterIds:[],observationCount:1},{name:'Zona sem vínculo',parameterIds:[],observationCount:0}]}};
 let rendered;page.parametersPage({state,icon:()=>'',parameterTable:rows=>{rendered=rows.map(r=>r.name);return '';}});
 assert.deepEqual(rendered,['Pressão vinculada','Leitura histórica']);
 assert.equal(typeof page.visibleParameters,'function');
 state.search='zona';assert.deepEqual(page.visibleParameters(state),[]);
 state.search='PRESSÃO';assert.deepEqual(page.visibleParameters(state).map(r=>r.name),['Pressão vinculada']);
 state.search='';assert.deepEqual(page.visibleParameters(state).map(r=>r.name),rendered);
 assert.equal(state.dashboard.parameters.length,3);
});
