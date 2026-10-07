import {firebaseError} from '../repositories/firebase-repository.js';
import {requireThat} from '../domain/errors.js';
export function resolveLoginEmail(re,accounts) {
  requireThat(typeof re==='string'&&/^\d{5}$/.test(re.trim()),'INVALID_LOGIN');
  const key=re.trim();
  requireThat(Object.hasOwn(accounts,key)&&typeof accounts[key]==='string'&&accounts[key].length>0,'INVALID_LOGIN');
  return accounts[key];
}
export function createAuthService({auth,sdk,loginAccounts}) {
  const invoke=async fn=>{try{return await fn();}catch(e){throw firebaseError(e);}};
  return {
    signIn:(identifier,password)=>invoke(()=>sdk.signInWithEmailAndPassword(auth,loginAccounts?resolveLoginEmail(identifier,loginAccounts):identifier,password)),
    signOut:()=>invoke(()=>sdk.signOut(auth)),
    resetPassword:email=>invoke(()=>sdk.sendPasswordResetEmail(auth,email)),
    updateDisplayName:displayName=>invoke(async()=>{
      requireThat(auth.currentUser,'AUTH_REQUIRED');
      requireThat(typeof displayName==='string'&&displayName.trim().length>0&&displayName.length<=100,'VALIDATION','displayName');
      await sdk.updateProfile(auth.currentUser,{displayName:displayName.trim()});
    }),
    changePassword:({currentPassword,newPassword})=>invoke(async()=>{
      requireThat(auth.currentUser,'AUTH_REQUIRED');
      requireThat(typeof currentPassword==='string'&&currentPassword.length>0&&typeof newPassword==='string'&&newPassword.length>=6,'VALIDATION','password');
      const credential=sdk.EmailAuthProvider.credential(auth.currentUser.email,currentPassword);
      await sdk.reauthenticateWithCredential(auth.currentUser,credential);
      await sdk.updatePassword(auth.currentUser,newPassword);
    }),
    watchSession:(onNext,onError)=>sdk.onAuthStateChanged(auth,onNext,error=>onError?.(firebaseError(error)))
  };
}
