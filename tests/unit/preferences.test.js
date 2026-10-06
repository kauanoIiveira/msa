import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readPreferences,writePreferences,applyTheme} from '../../app/src/ui/preferences.js';
import {enableVlibras,disableVlibras} from '../../app/src/ui/vlibras.js';

const preferenceKey='msa.ui.preferences.v1';

function memoryStorage(initial) {
  const values=new Map(initial===undefined?[]:[[preferenceKey,initial]]);
  return {
    getItem:key=>values.get(key)??null,
    setItem:(key,value)=>values.set(key,value)
  };
}

function widgetDocument() {
  const scripts=[];
  const document={
    defaultView:{},
    documentElement:{dataset:{}},
    getElementById:id=>id==='vlibras-access-wrapper'?document.widget:null,
    querySelector:selector=>selector==='script[data-vlibras="true"]'?scripts[0]??null:null,
    createElement:tag=>{
      assert.equal(tag,'script');
      const script=new EventTarget();
      script.dataset={};
      return script;
    },
    head:{appendChild:script=>scripts.push(script)}
  };
  function installWidget() {
    const button={};
    document.widget={shadowRoot:{querySelector:selector=>selector==='#vlibras-button'?button:null}};
    document.defaultView.VLibrasWidget={initBtn:button};
    return button;
  }
  return {document,scripts,installWidget};
}

test('empty or unreadable preferences default to light theme with VLibras disabled',()=>{
  assert.deepEqual(readPreferences(memoryStorage()),{theme:'light',vlibras:false});
  assert.deepEqual(readPreferences({getItem(){throw new Error('Storage denied');}}),{theme:'light',vlibras:false});
});

test('malformed saved preferences cannot enable optional scripts or invalid themes',()=>{
  for(const raw of ['{','null','[]','42','{"theme":"purple","vlibras":"true"}']) {
    assert.deepEqual(readPreferences(memoryStorage(raw)),{theme:'light',vlibras:false});
  }
});

test('valid saved theme and VLibras choices are restored',()=>{
  for(const theme of ['light','dark','system']) {
    assert.deepEqual(readPreferences(memoryStorage(JSON.stringify({theme,vlibras:true,extra:'ignored'}))),{theme,vlibras:true});
  }
});

test('writing one preference preserves the other and persists the normalized result',()=>{
  const storage=memoryStorage('{"theme":"dark","vlibras":false}');
  assert.deepEqual(writePreferences({vlibras:true},storage),{theme:'dark',vlibras:true});
  assert.equal(storage.getItem(preferenceKey),'{"theme":"dark","vlibras":true}');
  assert.deepEqual(writePreferences({theme:'invalid',vlibras:1},storage),{theme:'light',vlibras:false});
});

test('preference write failures reach the caller',()=>{
  const failure=new Error('Storage quota exceeded');
  const storage={getItem:()=>null,setItem(){throw failure;}};
  assert.throws(()=>writePreferences({theme:'dark'},storage),error=>error===failure);
});

test('explicit themes ignore the system setting and update the document root',()=>{
  const document={documentElement:{dataset:{}}};
  assert.equal(applyTheme('light',{document,media:{matches:true}}),'light');
  assert.equal(document.documentElement.dataset.theme,'light');
  assert.equal(applyTheme('dark',{document,media:{matches:false}}),'dark');
  assert.equal(document.documentElement.dataset.theme,'dark');
});

test('system theme resolves from media and invalid choices resolve to light',()=>{
  const document={documentElement:{dataset:{}}};
  assert.equal(applyTheme('system',{document,media:{matches:true}}),'dark');
  assert.equal(applyTheme('system',{document,media:{matches:false}}),'light');
  assert.equal(applyTheme('invalid',{document,media:{matches:true}}),'light');
});

test('VLibras loads lazily once and resolves only after the official button exists',async()=>{
  const {document,scripts,installWidget}=widgetDocument();
  const statesA=[],statesB=[];
  const first=enableVlibras({document,onState:state=>statesA.push(state)});
  const second=enableVlibras({document,onState:state=>statesB.push(state)});
  assert.equal(scripts.length,1);
  assert.equal(scripts[0].src,'https://vlibras.gov.br/app/vlibras-plugin.js');
  assert.equal(scripts[0].dataset.vlibras,'true');
  assert.deepEqual(statesA,['loading']);
  const button=installWidget();
  scripts[0].dispatchEvent(new Event('load'));
  assert.equal(await first,button);
  assert.equal(await second,button);
  assert.deepEqual(statesA,['loading','ready']);
  assert.deepEqual(statesB,['loading','ready']);
  const statesC=[];
  assert.equal(await enableVlibras({document,onState:state=>statesC.push(state)}),button);
  assert.deepEqual(statesC,['ready']);
  assert.equal(scripts.length,1);
});

test('VLibras waits for the automatic initialization after the script load',async t=>{
  t.mock.timers.enable({apis:['setTimeout','setInterval']});
  const {document,scripts,installWidget}=widgetDocument();
  let ready=false;
  const loading=enableVlibras({document,onState:state=>{if(state==='ready')ready=true;}});
  scripts[0].dispatchEvent(new Event('load'));
  await Promise.resolve();
  assert.equal(ready,false);
  const button=installWidget();
  t.mock.timers.tick(100);
  assert.equal(await loading,button);
  assert.equal(ready,true);
});

test('VLibras reports network load failure with an actionable error code',async()=>{
  const {document,scripts}=widgetDocument();
  const states=[];
  const loading=enableVlibras({document,onState:(state,error)=>states.push({state,error})});
  scripts[0].dispatchEvent(new Event('error'));
  await assert.rejects(loading,{name:'MsaError',code:'VLIBRAS_UNAVAILABLE'});
  assert.deepEqual(states.map(entry=>entry.state),['loading','error']);
  assert.equal(states[1].error.code,'VLIBRAS_UNAVAILABLE');
});

test('VLibras rejects a loaded script that never exposes its widget within 15 seconds',async t=>{
  t.mock.timers.enable({apis:['setTimeout','setInterval']});
  const {document,scripts}=widgetDocument();
  const loading=enableVlibras({document});
  scripts[0].dispatchEvent(new Event('load'));
  t.mock.timers.tick(15000);
  await assert.rejects(loading,{code:'VLIBRAS_UNAVAILABLE'});
});

test('disabling VLibras saves the disabled preference before reloading the page',()=>{
  const storage=memoryStorage('{"theme":"dark","vlibras":true}');
  let reloads=0;
  disableVlibras({storage,reload:()=>{
    reloads++;
    assert.deepEqual(readPreferences(storage),{theme:'dark',vlibras:false});
  }});
  assert.equal(reloads,1);
});

test('disabling VLibras does not reload if the preference cannot be saved',()=>{
  const failure=new Error('Storage denied');
  const storage={getItem:()=>null,setItem(){throw failure;}};
  let reloads=0;
  assert.throws(()=>disableVlibras({storage,reload:()=>reloads++}),error=>error===failure);
  assert.equal(reloads,0);
});
