// Patch a persisted snapshot without replacing focused controls or chart canvases.
export function patchSnapshot(root,html){
 const template=root.ownerDocument.createElement('template');template.innerHTML=html;
 const key=n=>n.nodeType===1?(n.id||['data-action','data-detail','data-page-tab','data-pending'].map(a=>n.getAttribute(a)||'').join('|')):'';
 const retained=n=>n.nodeType===1&&n.classList.contains('chart-consultation');
 const compatible=(a,b)=>a.nodeType===b.nodeType&&(a.nodeType!==1||a.tagName===b.tagName)&&key(a)===key(b);
 function patch(a,b){
  if(a.nodeType!==1){if(a.nodeValue!==b.nodeValue)a.nodeValue=b.nodeValue;return;}
  if(a.tagName==='CANVAS'||a.tagName==='SVG')return;
  for(const attr of [...a.attributes])if(!b.hasAttribute(attr.name)&&!(a.tagName==='DETAILS'&&attr.name==='open'))a.removeAttribute(attr.name);
  for(const attr of b.attributes)if(a.getAttribute(attr.name)!==attr.value)a.setAttribute(attr.name,attr.value);
  children(a,b);
 }
 function children(a,b){
  const old=[...a.childNodes].filter(n=>!retained(n)),fresh=[...b.childNodes];let position=0;
  for(const wanted of fresh){let actual=old[position];
   if(!actual||!compatible(actual,wanted)){const found=old.findIndex((n,i)=>i>position&&key(wanted)&&compatible(n,wanted));
    if(found>=0){actual=old.splice(found,1)[0];old.splice(position,0,actual);a.insertBefore(actual,old[position+1]??null);}
    else{actual=wanted.cloneNode(true);a.insertBefore(actual,old[position]??null);old.splice(position,0,actual);}
   }
   patch(actual,wanted);position++;
  }
  for(const extra of old.slice(position))extra.remove();
 }
 children(root,template.content);
}
