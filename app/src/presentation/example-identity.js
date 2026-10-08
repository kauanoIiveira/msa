import {requireThat} from '../domain/errors.js';
import {nhplCatalog} from '../catalog/nhpl.js';

// Human labels are derived separately from immutable namespace IDs. Revisions
// pass packageId (the original package), never the new manifest revision ID.
export function presentationExampleIdentity(packageId,product){
 const parsed=/^presentation_(\d{8})_([A-Za-z0-9_-]+)$/.exec(packageId);
 const item={vgard:{code:'HP',label:'VGARD HP'},mark:{code:'MV',label:'MARK V'},selo:{code:'SL',label:'Selo V-Gard'}}[product];
 requireThat(parsed&&item,'INVALID_EXAMPLE_IDENTITY');
 const [,date,version]=parsed,suffix=`${item.code}-${date.slice(2)}-${version.toUpperCase()}`;
 const context={order:`OP-${suffix}`,lot:`LT-${suffix}`};
 if(product!=='selo'){requireThat(nhplCatalog.variants.includes('Medium'),'INVALID_EXAMPLE_VARIANT');context.variant='Medium';}
 return {context,productLabel:item.label,recipeLabel:`${item.label} · Configuração ${version}`};
}
