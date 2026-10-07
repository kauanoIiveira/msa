import * as sdk from './repositories/firebase-sdk-browser.js';
import {firebaseConfig} from './config/firebase.js';
import {createFirebaseRepository} from './repositories/firebase-repository.js';
import {createAuthService} from './services/auth.js';
import {createAuthenticatedMsa} from './services/create-msa.js';
import {requireThat} from './domain/errors.js';
export function createBrowserMsa({papa=globalThis.Papa,emulator}={}) {
  requireThat(papa?.parse&&papa?.unparse,'CSV_LIBRARY_REQUIRED');
  if(emulator) requireThat(emulator.projectId?.startsWith('demo-'),'EMULATOR_PROJECT_REQUIRED');
  const config=emulator?{...firebaseConfig,projectId:emulator.projectId,databaseURL:`https://${emulator.projectId}.firebaseio.com`,apiKey:'demo-key',authDomain:`${emulator.projectId}.firebaseapp.com`}:firebaseConfig;
  const app=sdk.initializeApp(config),auth=sdk.getAuth(app),db=sdk.getDatabase(app);
  if(emulator) {sdk.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});sdk.connectDatabaseEmulator(db,'127.0.0.1',9000);}
  const authService=createAuthService({auth,sdk});
  const session=createAuthenticatedMsa({authService,papa,repositoryFactory:workspaceId=>createFirebaseRepository({db,sdk,workspaceId})});
  return {auth:authService,session,repository:workspaceId=>createFirebaseRepository({db,sdk,workspaceId}),dispose:async()=>{session.dispose();await sdk.deleteApp(app);}};
}
