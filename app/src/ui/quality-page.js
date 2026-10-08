import {pageTabs} from './workspace-routes.js';
export function qualityPage({state,renderers}){const tab=state.pageTabs?.quality??'losses';return pageTabs('quality',tab,[['losses','Refugos e perdas'],['inspections','Inspeções']])+(tab==='inspections'?renderers.inspections():renderers.records('losses'));}
