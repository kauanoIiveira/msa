import test from 'node:test';import assert from 'node:assert/strict';import {overviewMarkup} from '../../app/src/ui/overview.js';
test('overview preserves both charts and explains missing reliability rather than inventing zero',()=>{
 const html=overviewMarkup({state:{dashboard:{totals:{}},asOf:1},metrics:{aggregate:null,reliability:{mtbf:{value:null,reason:'no-failures'},mttr:{value:null,reason:'no-repairs'}}},productivity:{aggregate:null},pending:{open:[],checks:[],complete:false},renderers:{charts:()=>'<canvas id="nhpl-interval-chart"></canvas><canvas id="nhpl-accumulated-chart"></canvas>',detail:()=>'',parameters:()=>'',queue:()=>''}});
 for(const text of ['Disponibilidade × desempenho × qualidade','Tempo em operação ÷ número de falhas','Tempo de reparo ÷ reparos concluídos','Sem falhas registradas no período','Lista parcial','nhpl-interval-chart','nhpl-accumulated-chart'])assert.ok(html.includes(text),text);
});
