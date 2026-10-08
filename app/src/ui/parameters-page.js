import {escapeHtml as e} from './format.js';
export function visibleParameters(state,search=state.search??''){
 const query=search.toLocaleLowerCase('pt-BR');
 return (state.dashboard?.parameters??[]).filter(p=>(state.simulation||p.parameterIds?.length||p.observationCount)&&p.name.toLocaleLowerCase('pt-BR').includes(query));
}
export function parametersPage({state,parameterTable,icon}){
 const params=visibleParameters(state,'');
 return `<div class="table-tools"><label class="search-field">${icon('search')}<input id="parameter-search" type="search" placeholder="Buscar parâmetro" aria-label="Buscar parâmetro" value="${e(state.search)}"></label><span class="small muted">${params.length} parâmetros · A busca reduz somente esta tabela.</span></div><div id="parameter-results">${parameterTable(visibleParameters(state))}</div>`;
}
