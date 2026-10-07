import {readFileSync,writeFileSync} from 'node:fs';
function edit(path,replacements){let source=readFileSync(path,'utf8');for(const[old,next]of replacements){if(!source.includes(old))throw Error('Missing anchor '+path+' '+old);source=source.replaceAll(old,next);}writeFileSync(path,source);}
edit('app/src/ui/cep.js',[
 [`\${a.nValid} leituras válidas · \${a.nMissing} ausentes · \${a.nInvalid} inválidas · \${e(s.version?.unit??'')}`,`\${a.nValid} leituras válidas · \${a.nMissing} ausentes · \${a.nInvalid} inválidas · \${a.nConflicted} conflitantes · \${e(s.unit??'')}`],
 [`\${e(s.version?.unit??'')}`,`\${e(s.unit??'')}`],
 [`<td>\${e(sample.raw??'')}</td>`,`<td>\${sample.correctionId?\`\${e(sample.originalRaw??'')} → \${e(sample.raw??'')}<div class="small muted">Correção: \${e(sample.correctionId)}</div>\`:e(sample.raw??'')}</td>`],
 [`(sample.status==='valid'?'Sem sinal':sample.status)`,`(sample.revisionConflict?'Revisão conflitante':sample.status==='valid'?'Sem sinal':sample.status)`],
 [`if(s.version?.rule?.kind==='range')`,`if(s.version?.rule?.kind==='range'&&a.reason!=='incompatible-unit')`],
 [`unit:s.version?.unit??''`,`unit:s.unit??''`],
 [`17 linhas históricas, sem horário/subgrupo. Não são produção ao vivo.`,`17 linhas históricas de 25/08 a 29/09/2026, sem horário/subgrupo. Não são produção ao vivo.`]
]);
edit('app/src/ui/main.js',[[`(s.status === "valid" ? s.value : null)`,`(s.status === "valid" && !s.revisionConflict ? s.value : null)`]]);
edit('tests/unit/cep-evidence.test.js',[[`parameters:{parameter},parameterVersions:{v:version}`,`parameters:{parameter:structuredClone(parameter)},parameterVersions:{v:structuredClone(version)}`]]);
