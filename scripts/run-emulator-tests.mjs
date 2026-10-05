import {spawn} from 'node:child_process';
import {readdir,access} from 'node:fs/promises';
import {resolve} from 'node:path';
const args=process.argv.slice(2);
for(const arg of args) if(!/^tests\/[A-Za-z0-9_./*-]+\.test\.js$/.test(arg)) throw new Error('Only test file paths are accepted');
let javaHome=process.env.JAVA_HOME;
if(!javaHome) {
  const dirs=await readdir('.runtime/java').catch(()=>[]);
  javaHome=dirs.length?resolve('.runtime/java',dirs.find(x=>x.startsWith('jdk-'))??dirs[0]):null;
}
if(!javaHome) throw new Error('Set JAVA_HOME to a JDK >=21. No cloud fallback.');
await access(resolve(javaHome,'bin',process.platform==='win32'?'java.exe':'java'));
const files=args.length?args:['tests/rules/*.test.js','tests/integration/*.test.js'];
const command=`"${process.execPath}" --test --test-concurrency=1 ${files.join(' ')}`;
const child=spawn(process.execPath,['node_modules/firebase-tools/lib/bin/firebase.js','emulators:exec','--project','demo-msa','--only','database,auth',command],{
  stdio:'inherit',env:{...process.env,JAVA_HOME:javaHome,PATH:`${resolve(javaHome,'bin')}${process.platform==='win32'?';':':'}${process.env.PATH}`,GCLOUD_PROJECT:'demo-msa'}
});
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>child.kill(signal));
child.on('error',e=>{console.error(e);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
