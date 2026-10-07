import {assertId,knownKeys,requireThat} from './errors.js';
export const contextKey=context=>JSON.stringify(Object.entries(context??{}).sort(([a],[b])=>a.localeCompare(b)));
export function assertContext(context,{machines,processes,products}) {
  knownKeys(context,['machineId','processId','productId','recipe','lot','order','shift']);
  for(const field of ['machineId','processId','productId']) assertId(context[field],field);
  const machine=machines?.[context.machineId],process=processes?.[context.processId],product=products?.[context.productId];
  requireThat(machine?.active===true&&process?.active===true&&product?.active===true,'INVALID_REFERENCE');
  requireThat(process.machineId===context.machineId&&product.processIds?.[context.processId]===true,'CONTEXT_MISMATCH');
  for(const field of ['recipe','lot','order','shift']) if(context[field]!=null) requireThat(typeof context[field]==='string'&&context[field].trim().length>0&&context[field].length<=100,'VALIDATION',field);
  return structuredClone(context);
}
export async function loadContext(repo,context) {
  const machines={[context.machineId]:await repo.get(`machines/${assertId(context.machineId)}`)};
  const processes={[context.processId]:await repo.get(`processes/${assertId(context.processId)}`)};
  const products={[context.productId]:await repo.get(`products/${assertId(context.productId)}`)};
  return assertContext(context,{machines,processes,products});
}
