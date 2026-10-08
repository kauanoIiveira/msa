import {assertId,knownKeys,requireThat} from './errors.js';
import {assertShiftPeriod,shiftAt,normalizeShift} from './shifts.js';
import {validateDate} from './time.js';
export const productionCaseFields=['machineId','processId','productId','variant','order','lot','recipeVersionId','shift','operationalDate','startedAt','endedAt','status'];
export function productionCaseContext(row) {
 const context=Object.fromEntries(['machineId','processId','productId','variant','order','lot','shift'].filter(k=>row[k]!=null).map(k=>[k,row[k]]));
 if(row.recipeVersionId)context.recipe=row.recipeVersionId;
 return context;
}
export function validateProductionCase(input) {
 knownKeys(input,productionCaseFields);
 for(const key of ['machineId','processId','productId'])assertId(input[key],key);
 for(const key of ['order','lot'])requireThat(typeof input[key]==='string'&&input[key].trim().length>0&&input[key].length<=100,'VALIDATION',key);
 if(input.variant!=null)requireThat(typeof input.variant==='string'&&input.variant.trim()&&input.variant.length<=100,'VALIDATION','variant');
 if(input.recipeVersionId!=null)assertId(input.recipeVersionId,'recipeVersionId');
 const row={...input,order:input.order.trim(),lot:input.lot.trim(),shift:normalizeShift(input.shift)};
 assertShiftPeriod(row,row.startedAt,row.endedAt);validateDate(row.operationalDate);
 requireThat(shiftAt(row.startedAt).operationalDate===row.operationalDate,'INVALID_DATE');
 requireThat(['planned','running','closed'].includes(row.status),'VALIDATION','status');
 return row;
}
