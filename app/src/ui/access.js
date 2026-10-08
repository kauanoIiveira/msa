const all=['dashboard','equipment','parameters','operations','planning','engineering','cep','history','registry','indicators'];
export function visibleNavigation(role){return role==='admin'||role==='engineer'?[...all]:role==='operator'?['dashboard','equipment','parameters','operations','planning','history','indicators']:['dashboard','equipment','parameters','planning','cep','history','indicators'];}
export function initialRoute(role){return role==='engineer'?'engineering':role==='operator'?'operations':'dashboard';}
export function resolveRoute(route,role){return ['settings','capture','tv','production','stoppages','quality'].includes(route)||visibleNavigation(role).includes(route)?route:initialRoute(role);}
