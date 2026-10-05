import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment} from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/database';
export {sdk};
export async function setup(t) {
  const env=await initializeTestEnvironment({projectId:'demo-msa',database:{host:'127.0.0.1',port:9000,rules:await readFile(new URL('../../firebase/database.rules.json',import.meta.url),'utf8')}});
  await env.clearDatabase();
  await env.withSecurityRulesDisabled(async ctx=>{
    await sdk.set(sdk.ref(ctx.database(),'workspaces/demo/members'),{admin:{role:'admin'},op:{role:'operator'},eng:{role:'engineer'},view:{role:'viewer'}});
    await sdk.set(sdk.ref(ctx.database(),'workspaces/other/members'),{outsider:{role:'admin'}});
  });
  t.after(()=>env.cleanup());
  return env;
}
