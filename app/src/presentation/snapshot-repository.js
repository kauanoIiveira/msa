// Isolated, additive repository used only for package preparation and replay.
// It never forwards writes to the source repository.
export function createSnapshotRepository({timestamp=()=>({'.sv':'timestamp'})}={}){
  const values=new Map();
  const clone=value=>value==null?null:structuredClone(value);
  const get=path=>{
    let base=null;
    for(const [key,value] of [...values].sort(([a],[b])=>a.length-b.length))if(path.startsWith(key+'/')){
      let node=value;for(const part of path.slice(key.length+1).split('/'))node=node?.[part];if(node!=null)base=clone(node);
    }
    if(values.has(path))base=clone(values.get(path));
    const prefix=path+'/';for(const [key,value] of [...values].sort(([a],[b])=>a.length-b.length))if(key.startsWith(prefix)){
      base??={};let node=base;const parts=key.slice(prefix.length).split('/');for(const part of parts.slice(0,-1))node=node[part]??={};node[parts.at(-1)]=clone(value);
    }
    return base;
  };
  return {timestamp,get:async path=>get(path),
    create:async(path,value)=>{if(get(path)!=null){const error=new Error('CONTENT_CONFLICT');error.code='CONTENT_CONFLICT';throw error;}values.set(path,clone(value));return clone(value);},
    updateRegistry:async(path,patch)=>{const before=get(path);if(before==null){const error=new Error('NOT_FOUND');error.code='NOT_FOUND';throw error;}const next={...before,...patch};values.set(path,clone(next));return clone(next);},
    transact:async(path,update)=>{const next=update(get(path));if(next===undefined){const error=new Error('CONFLICT');error.code='CONFLICT';throw error;}values.set(path,clone(next));return clone(next);},
    list:async(path,{fromDate,toDate,cursor,limit=200}={})=>{
      const rows=Object.entries(get(path)??{}).map(([id,value])=>({...value,id})).filter(r=>(!fromDate||r.eventDate>=fromDate)&&(!toDate||r.eventDate<=toDate)&&(!cursor||r.eventDate>cursor.date||(r.eventDate===cursor.date&&r.id>cursor.key))).sort((a,b)=>a.eventDate.localeCompare(b.eventDate)||a.id.localeCompare(b.id));
      const items=rows.slice(0,limit),last=items.at(-1);return {items,complete:rows.length<=limit,nextCursor:rows.length>limit?{date:last.eventDate,key:last.id}:null};
    }
  };
}
