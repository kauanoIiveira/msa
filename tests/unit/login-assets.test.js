import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createStaticServer} from '../../scripts/serve.mjs';

test('login photos and the full brand image are served intact with image MIME types',async t=>{
  const server=await createStaticServer({port:0});
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  for(const [asset,type,hash] of [
    ['msaphoto.webp','image/webp','25b1870898573b2525c8702a59e007a5dba6e201300d95d81a833eb7a59c770b'],
    ['msa-logo-full.png','image/png','b5147631a5b9e5764dc4ca38af546426d43832793773b1c8b21592e1e19c7369'],
  ]) {
    const response=await fetch(`${base}/assets/msa/${asset}`);
    assert.equal(response.status,200,`${asset} must load`);
    assert.equal(response.headers.get('content-type').split(';')[0],type);
    assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),hash);
  }
  const documentResponse=await fetch(`${base}/referencias-locais/MANIFESTO_FONTES.json`);
  assert.equal(documentResponse.status,404,'local source documents must not be served by the app');
});
