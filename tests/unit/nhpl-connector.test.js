import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startConnector} from '../../scripts/nhpl-connector.mjs';
test('folder connector waits for stable files, rejects conflicts and confines CORS',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'msa-capture-test-'));
 const con=await startConnector({directory:dir,port:0,pollMs:60000});t.after(async()=>{await con.close();await rm(dir,{recursive:true,force:true});});
 const event={schemaVersion:1,sourceId:'test',eventId:'e1',sequence:1,occurredAt:10000,type:'state',state:'stopped'};
 await writeFile(join(dir,'1.json'),JSON.stringify(event));await con.scan();
 const url='http://127.0.0.1:'+con.server.address().port+'/events';assert.equal((await(await fetch(url)).json()).events.length,0);
 await con.scan();assert.equal((await(await fetch(url)).json()).events.length,1);
 await writeFile(join(dir,'2.json'),JSON.stringify({...event,state:'running'}));await con.scan();await con.scan();const q=await(await fetch(url)).json();assert.equal(q.events.length,1);assert.match(q.errors[0].message,/conflitante/);
 assert.equal((await fetch(url,{headers:{Origin:'https://untrusted.example'}})).status,403);
 assert.equal((await fetch(url+'/other')).status,404);
});
