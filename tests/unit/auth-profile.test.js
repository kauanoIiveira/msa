import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthService} from '../../app/src/services/auth.js';
test('profile editing targets the signed-in user; password change reauthenticates first',async()=>{
 const user={email:'adm@adm.com'},calls=[];
 const sdk={updateProfile:async(u,p)=>calls.push(['profile',u,p]),EmailAuthProvider:{credential:(email,password)=>({email,password})},reauthenticateWithCredential:async(u,c)=>calls.push(['reauth',u,c]),updatePassword:async(u,p)=>calls.push(['password',u,p])};
 const auth=createAuthService({auth:{currentUser:user},sdk});
 await auth.updateDisplayName('Fabiana Dias');assert.deepEqual(calls[0],['profile',user,{displayName:'Fabiana Dias'}]);
 await auth.changePassword({currentPassword:'old-secret',newPassword:'new-secret'});
 assert.equal(calls[1][0],'reauth');assert.equal(calls[2][0],'password');
 await assert.rejects(auth.changePassword({currentPassword:'old',newPassword:'abc'}));
});
