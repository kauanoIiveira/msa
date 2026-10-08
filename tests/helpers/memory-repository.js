import {requireThat} from '../../app/src/domain/errors.js';
export function memoryRepository() {
  const values=new Map(),listeners=new Set();
  const clone=value=>value==null?null:structuredClone(value);
  const notify=()=>{for(const listener of listeners) listener();};
  const get=path=>{
    let base=values.has(path)?clone(values.get(path)):null;
    for(const [key,value] of values)if(path.startsWith(key+'/')){let node=value;for(const part of path.slice(key.length+1).split('/'))node=node?.[part];if(node!=null)base=clone(node);}
    const prefix=path+'/';for(const [key,value] of values)if(key.startsWith(prefix)){base??={};let node=base;const parts=key.slice(prefix.length).split('/');for(const part of parts.slice(0,-1))node=node[part]??={};node[parts.at(-1)]=clone(value);}
    return base;
  };
  const list=(path,q={})=>{
    const rows=Object.entries(get(path)??{}).map(([id,value])=>({...value,id})).filter(r=>(!q.fromDate||r.eventDate>=q.fromDate)&&(!q.toDate||r.eventDate<=q.toDate)&&(!q.cursor||r.eventDate>q.cursor.date||(r.eventDate===q.cursor.date&&r.id>q.cursor.key))).sort((a,b)=>a.eventDate.localeCompare(b.eventDate)||a.id.localeCompare(b.id));
    const limit=q.limit??200,items=rows.slice(0,limit),complete=rows.length<=limit,last=items.at(-1);
    return {items,complete,nextCursor:!complete?{date:last.eventDate,key:last.id}:null};
  };
  return {listenerCount:()=>listeners.size,timestamp:()=>Date.UTC(2026,9,5),get:async path=>get(path),
    create:async(path,data)=>{requireThat(!values.has(path),'CONFLICT'); values.set(path,clone(data));notify();return clone(data);},
    updateRegistry:async(path,patch)=>{requireThat(values.has(path),'NOT_FOUND');const value={...get(path),...patch};values.set(path,value);notify();return clone(value);},
    transact:async(path,updater)=>{const next=updater(get(path));requireThat(next!==undefined,'CONFLICT');values.set(path,clone(next));notify();return clone(next);},
    list:async(path,q)=>list(path,q),
    watch:(path,q,callback)=>{const emit=()=>callback(q?list(path,q):get(path));listeners.add(emit);queueMicrotask(emit);return()=>listeners.delete(emit);}
  };
}
