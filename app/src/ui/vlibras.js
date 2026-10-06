import {MsaError} from '../domain/errors.js';
import {writePreferences} from './preferences.js';

const requests=new WeakMap();
const scriptUrl='https://vlibras.gov.br/app/vlibras-plugin.js';

function widgetButton(document) {
  const button=document.defaultView?.VLibrasWidget?.initBtn;
  const wrapper=document.getElementById('vlibras-access-wrapper');
  return button && wrapper?.shadowRoot?.querySelector('#vlibras-button')===button?button:null;
}

function loadWidget(document) {
  return new Promise((resolve,reject)=>{
    let settled=false;
    let script=document.querySelector('script[data-vlibras="true"]');
    const existing=Boolean(script);
    if(!script) {
      script=document.createElement('script');
      script.src=scriptUrl;
      script.async=true;
      script.dataset.vlibras='true';
    }
    const timeout=setTimeout(fail,15000);
    const poll=setInterval(check,100);

    function cleanup() {
      clearTimeout(timeout);
      clearInterval(poll);
      script.removeEventListener('load',check);
      script.removeEventListener('error',fail);
    }
    function fail() {
      if(settled) return;
      settled=true;
      cleanup();
      reject(new MsaError('VLIBRAS_UNAVAILABLE','VLibras indisponivel. Verifique sua conexao.'));
    }
    function check() {
      if(settled) return;
      const button=widgetButton(document);
      if(!button) return;
      settled=true;
      cleanup();
      resolve(button);
    }

    script.addEventListener('load',check);
    script.addEventListener('error',fail);
    try {
      if(!existing) (document.head || document.body || document.documentElement).appendChild(script);
      // v7 creates its own widget after load; calling its constructor would duplicate initialization.
      check();
    } catch {
      fail();
    }
  });
}

export async function enableVlibras({document=globalThis.document,onState=()=>{}}={}) {
  if(!document) {
    const error=new MsaError('VLIBRAS_UNAVAILABLE');
    onState('error',error);
    throw error;
  }
  let request=requests.get(document);
  if(!request) {
    const button=widgetButton(document);
    request={state:button?'ready':'loading',error:undefined,promise:undefined};
    requests.set(document,request);
    request.promise=button?Promise.resolve(button):loadWidget(document).then(value=>{
      request.state='ready';
      return value;
    },error=>{
      request.state='error';
      request.error=error;
      throw error;
    });
  }
  if(request.state==='ready') {
    onState('ready');
    return request.promise;
  }
  if(request.state==='error') {
    onState('error',request.error);
    throw request.error;
  }
  onState('loading');
  try {
    const button=await request.promise;
    onState('ready');
    return button;
  } catch(error) {
    onState('error',error);
    throw error;
  }
}

export function disableVlibras({
  reload=()=>globalThis.location.reload(),
  storage=globalThis.localStorage
}={}) {
  const preferences=writePreferences({vlibras:false},storage);
  reload();
  return preferences;
}
