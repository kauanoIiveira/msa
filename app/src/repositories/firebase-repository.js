import {assertId,requireThat,MsaError} from '../domain/errors.js';
export function firebaseError(error) {
  if(error instanceof MsaError) return error;
  const code=String(error?.code??'').toLowerCase();
  const kind=code.includes('permission')?'FORBIDDEN':code.startsWith('auth/')?'AUTH':code.includes('network')||code.includes('unavailable')?'NETWORK':'FIREBASE';
  return new MsaError(kind,error?.message??kind);
}
export function createFirebaseRepository({db,sdk,workspaceId}) {
  assertId(workspaceId,'workspaceId');
  const reference=path=>{
    requireThat(typeof path==='string' && path.split('/').every(part=>/^[A-Za-z0-9_-]{1,100}$/.test(part)),'INVALID_PATH');
    return sdk.ref(db,`workspaces/${workspaceId}/${path}`);
  };
  const protect=async fn=>{try{return await fn();}catch(e){throw firebaseError(e);}};
  const queryRef=(path,q)=>{
    const ref=reference(path);
    if(!q) return ref;
    const limit=q.limit??200;
    requireThat(Number.isInteger(limit)&&limit>=1&&limit<=500,'INVALID_QUERY');
    const constraints=[sdk.orderByChild('eventDate')];
    if(q.cursor) constraints.push(sdk.startAfter(q.cursor.date,q.cursor.key));
    else if(q.fromDate) constraints.push(sdk.startAt(q.fromDate));
    if(q.toDate) constraints.push(sdk.endAt(q.toDate));
    constraints.push(sdk.limitToFirst(limit+1));
    return sdk.query(ref,...constraints);
  };
  const page=(snap,q)=>{
    const rows=[]; snap.forEach(child=>{rows.push({...child.val(),id:child.key});});
    const limit=q.limit??200,complete=rows.length<=limit,items=rows.slice(0,limit),last=items.at(-1);
    return {items,complete,nextCursor:!complete&&last?{date:last.eventDate,key:last.id}:null};
  };
  return {
    workspaceId,
    timestamp:()=>sdk.serverTimestamp(),
    get:path=>protect(async()=> (await sdk.get(reference(path))).val()),
    create:(path,data)=>protect(async()=>{
      const result=await sdk.runTransaction(reference(path),current=>current===null?data:undefined,{applyLocally:false});
      requireThat(result.committed,'CONFLICT'); return result.snapshot.val();
    }),
    updateRegistry:(path,patch)=>protect(async()=>{await sdk.update(reference(path),patch);return (await sdk.get(reference(path))).val();}),
    transact:(path,updater)=>protect(async()=>{
      const ref=reference(path); await sdk.get(ref);
      const result=await sdk.runTransaction(ref,updater,{applyLocally:false});
      requireThat(result.committed,'CONFLICT');return result.snapshot.val();
    }),
    list:(path,q={})=>protect(async()=>page(await sdk.get(queryRef(path,q)),q)),
    watch:(path,q,onNext,onError)=>{
      try{return sdk.onValue(queryRef(path,q),snap=>onNext(q?page(snap,q):snap.val()),error=>onError?.(firebaseError(error)));}
      catch(e){throw firebaseError(e);}
    },
    watchConnection:onNext=>sdk.onValue(sdk.ref(db,'.info/connected'),snap=>onNext(snap.val()===true))
  };
}
