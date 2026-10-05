import {readdir,readFile,access} from 'node:fs/promises';
import {resolve,relative,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'acorn';
export async function verifyStatic(root,{requireIndex=false}={}) {
  root=resolve(root);const errors=[];let files=0;
  async function visit(dir) {
    for(const entry of await readdir(dir,{withFileTypes:true})) {
      const path=resolve(dir,entry.name),name=relative(root,path);
      if(entry.isSymbolicLink()) {errors.push(`symlink:${name}`);continue;}
      if(entry.isDirectory()) {await visit(path);continue;}files++;
      if(/\.(pdf|xlsx?|csv|jpe?g|png|zip|env)$/i.test(entry.name)) errors.push(`non-code-artifact:${name}`);
      const text=await readFile(path,'utf8');
      if(/(?:file:\/\/|(?:^|[\s"'(])[A-Za-z]:[\\/]|BEGIN (?:RSA )?PRIVATE KEY|private_key\s*[=:]|serviceAccountKey)/m.test(text)) errors.push(`unsafe-content:${name}`);
      if(['.js','.mjs'].includes(extname(path))) {
        let ast;try {ast=parse(text,{ecmaVersion:'latest',sourceType:'module'});} catch(e) {errors.push(`syntax:${name}:${e.message}`);continue;}
        const sources=[];
        const walk=node=>{if(!node||typeof node!=='object') return;
          if(['ImportDeclaration','ExportAllDeclaration','ExportNamedDeclaration','ImportExpression'].includes(node.type)&&node.source) sources.push(node.source.value);
          for(const value of Object.values(node)) if(value&&typeof value==='object') {if(Array.isArray(value)) value.forEach(walk);else walk(value);}
        };walk(ast);
        for(const source of sources) {
          if(typeof source!=='string') {errors.push(`dynamic-import:${name}`);continue;}
          if(source.startsWith('https:')) {if(!/^https:\/\/www\.gstatic\.com\/firebasejs\/12\.19\.0\/firebase-(app|auth|database)\.js$/.test(source)) errors.push(`external-import:${name}:${source}`);continue;}
          const target=resolve(dirname(path),source),rel=relative(root,target);
          if(!source.startsWith('.')||rel.startsWith('..')||resolve(target)===root) {errors.push(`non-relative-import:${name}:${source}`);continue;}
          try {await access(target);}catch {errors.push(`missing-import:${name}:${source}`);}
        }
      }
    }
  }
  await visit(root);
  if(requireIndex) {
    try {const html=await readFile(resolve(root,'index.html'),'utf8');if(!html.includes('data-msa-functional="true"')) errors.push('interface-not-approved');}
    catch {errors.push('index-not-yet-implemented');}
  }
  return {ok:!errors.length,files,errors};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const result=await verifyStatic('app',{requireIndex:process.argv.includes('--deploy')});console.log(JSON.stringify(result,null,2));if(!result.ok) process.exitCode=1;
}
