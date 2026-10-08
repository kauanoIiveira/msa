export async function archiveLocalWorkspace({storage=globalThis.localStorage,uid}) {
 const keys=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith('msa.'))keys.push(key);}keys.sort();
 const values=Object.fromEntries(keys.map(key=>[key,storage.getItem(key)]));
 const backup={schemaVersion:1,owner:uid,values};
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(backup)));
 const hash=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
 return {backup,hash,keys};
}
