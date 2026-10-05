import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {verifyStatic} from '../../scripts/verify-static.mjs';
test('static artifact rejects industrial evidence, missing imports, credentials and premature deployment',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'msa-static-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  await mkdir(join(dir,'src'));await writeFile(join(dir,'src','entry.js'),'export const x=1;');
  assert.equal((await verifyStatic(dir)).ok,true);
  assert.equal((await verifyStatic(dir,{requireIndex:true})).ok,false);
  await writeFile(join(dir,'industrial.pdf'),'source');assert.equal((await verifyStatic(dir)).ok,false);await rm(join(dir,'industrial.pdf'));
  await writeFile(join(dir,'src','entry.js'),"import './missing.js';");assert.equal((await verifyStatic(dir)).ok,false);
  await writeFile(join(dir,'src','entry.js'),'const private_key="secret";');assert.equal((await verifyStatic(dir)).ok,false);
  await writeFile(join(dir,'src','entry.js'),'export const url="https://example.com";');assert.equal((await verifyStatic(dir)).ok,true);
});
