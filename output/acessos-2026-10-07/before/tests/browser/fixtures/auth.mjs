// Browser-only interception: never shipped or sent to Firebase.
export async function installAuthFixture(page,{empty=false,synthetic=false}={}) {
  await page.route('**/src/browser.js',route=>route.fulfill({contentType:'text/javascript',body:`
    import {openDemoWorkspace,createLocalRepository} from './ui/demo-workspace.js';
    import {createMsaServices} from './services/create-msa.js';
    export function createBrowserMsa(){
      let client,user=sessionStorage.getItem('msa.test.auth')?{uid:'fixture',email:'test@example.com',displayName:'Teste Visual'}:null;
      const authObservers=new Set(),observers=new Set();
      const notify=()=>{for(const callback of observers)callback({user,actor:user?client?.actor:null});};
      return {
        auth:{watchSession(callback){authObservers.add(callback);queueMicrotask(()=>callback(user));return()=>authObservers.delete(callback);},
          async signIn(email,password){window.authFixtureCalls=(window.authFixtureCalls??0)+1;await new Promise(resolve=>setTimeout(resolve,60));if(password!=='fixture-only')throw new Error('auth/invalid-credential');user={uid:'fixture',email,displayName:'Teste Visual'};sessionStorage.setItem('msa.test.auth','true');for(const cb of authObservers)cb(user);return {user};},
          async signOut(){user=null;sessionStorage.removeItem('msa.test.auth');notify();for(const cb of authObservers)cb(null);}},
        session:{watchSession(callback){observers.add(callback);callback({user,actor:user?client?.actor:null});return()=>observers.delete(callback);},
          async onWorkspace(workspace){window.authFixtureWorkspace=workspace;
            if(!client){${empty?`const local=createLocalRepository({data:Object.fromEntries(['machines','processes','products','parameters','parameterVersions','reasons','targets','collections','production','stoppages','losses','reviews','corrections'].map(key=>[key,{}]))});const actor={uid:'fixture',role:'viewer'};client={...local,actor,services:createMsaServices({repo:local.repo,actor,papa:globalThis.Papa})};`:`client=await openDemoWorkspace();${synthetic?'':`for(const kind of ['collections','production','losses','stoppages'])for(const r of Object.values(await client.repo.get(kind)??{}))if(r.origin==='demo')await client.repo.transact(kind+'/'+r.id,current=>({...current,origin:'manual'}));for(const r of Object.values(await client.repo.get('corrections')??{}))if(r.replacement.origin==='demo')await client.repo.transact('corrections/'+r.id,current=>({...current,replacement:{...current.replacement,origin:'manual'}}));`}`}}
            notify();return client.services;}},repository(){return client.repo;}
      };
    }
  `}));
}
