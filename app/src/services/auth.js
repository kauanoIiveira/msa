import {firebaseError} from '../repositories/firebase-repository.js';
export function createAuthService({auth,sdk}) {
  const invoke=async fn=>{try{return await fn();}catch(e){throw firebaseError(e);}};
  return {
    signIn:(email,password)=>invoke(()=>sdk.signInWithEmailAndPassword(auth,email,password)),
    signOut:()=>invoke(()=>sdk.signOut(auth)),
    resetPassword:email=>invoke(()=>sdk.sendPasswordResetEmail(auth,email)),
    watchSession:(onNext,onError)=>sdk.onAuthStateChanged(auth,onNext,error=>onError?.(firebaseError(error)))
  };
}
