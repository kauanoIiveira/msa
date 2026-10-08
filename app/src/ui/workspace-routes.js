import {visibleNavigation,initialRoute} from './access.js';
export function resolveWorkspaceRoute({route,tab,role}){
 if(route==='planning')return {route:'production',tab:'planning'};
 if(route==='operations'){if(tab==='stoppages')return {route:'stoppages',tab:'history'};if(tab==='losses')return {route:'quality',tab:'losses'};return {route:'production',tab:tab==='hourly'?'summary':tab==='occurrences'?'occurrences':'records'};}
 if(['production','stoppages','quality'].includes(route))return {route,tab};
 if(!['settings','capture','tv'].includes(route)&&!visibleNavigation(role).includes(route)){const first=initialRoute(role);return resolveWorkspaceRoute({route:first,role});}return {route,tab};
}
export function pageTabs(route,selected,items){return `<div class="tabs task-tabs" role="tablist" aria-label="Áreas da página">${items.map(([id,label])=>`<button type="button" role="tab" aria-selected="${id===selected}" class="tab ${id===selected?'active':''}" data-page-tab="${id}" data-page-route="${route}">${label}</button>`).join('')}</div>`;}
