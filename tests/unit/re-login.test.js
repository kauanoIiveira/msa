import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthService} from '../../app/src/services/auth.js';
const accounts={'00000':'adm@adm.com','00001':'00001@msa.test','00002':'00002@msa.test','00003':'00003@msa.test'};
test('RE login keeps leading zeros and resolves only explicitly bound Firebase accounts',async()=>{
 const calls=[],sdk={signInWithEmailAndPassword:async(auth,email,password)=>{calls.push({auth,email,password});return {user:{email}};}};
 const firebaseAuth={},auth=createAuthService({auth:firebaseAuth,sdk,loginAccounts:accounts});
 for(const [re,email] of Object.entries(accounts)){
  const result=await auth.signIn(re,'test-only-password');
  assert.equal(result.user.email,email);
  assert.deepEqual(calls.at(-1),{auth:firebaseAuth,email,password:'test-only-password'});
 }
 assert.equal((await auth.signIn(' 00000 ','test-only-password')).user.email,accounts['00000']);
});
test('unknown or malformed RE never reaches Firebase or guesses an account or permission',async()=>{
 let calls=0;const auth=createAuthService({auth:{},sdk:{signInWithEmailAndPassword:async()=>{calls++;}},loginAccounts:accounts});
 for(const re of ['00004','0000','000000','admin','adm@adm.com','__proto__',0,null])await assert.rejects(()=>auth.signIn(re,'test-only-password'),{code:'INVALID_LOGIN'});
 assert.equal(calls,0);
});
test('email auth service stays compatible when no RE bindings are supplied',async()=>{
 let email;const auth=createAuthService({auth:{},sdk:{signInWithEmailAndPassword:async(a,e)=>{email=e;}}});
 await auth.signIn('existing@example.com','test-only-password');assert.equal(email,'existing@example.com');
});
