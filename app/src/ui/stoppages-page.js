import {pageTabs} from './workspace-routes.js';
export function stoppagesPage({state,renderers}){const tab=state.pageTabs?.stoppages??'open';return pageTabs('stoppages',tab,[['open','Em aberto'],['history','Histórico'],['classification','Classificação']])+renderers.reliability()+ (tab==='classification'?renderers.classification():renderers.records('stoppages',tab==='open'));}
