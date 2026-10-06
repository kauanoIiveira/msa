import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
await mkdir(new URL('app/vendor/',root),{recursive:true});
for(const [source,target] of [
  ['node_modules/simple-statistics/dist/simple-statistics.mjs','simple-statistics.mjs'],
  ['node_modules/simple-statistics/LICENSE','simple-statistics.LICENSE'],
  ['node_modules/papaparse/papaparse.min.js','papaparse.min.js'],
  ['node_modules/papaparse/LICENSE','papaparse.LICENSE'],
  ['node_modules/chart.js/dist/chart.umd.min.js','chart.umd.min.js'],
  ['node_modules/chart.js/LICENSE.md','chart.LICENSE'],
  ['node_modules/lucide/dist/umd/lucide.min.js','lucide.min.js'],
  ['node_modules/lucide/LICENSE','lucide.LICENSE']
]) await copyFile(new URL(source,root),new URL(`app/vendor/${target}`,root));
const versions=await Promise.all(['simple-statistics','papaparse','chart.js','lucide'].map(async name=>{
  const pkg=JSON.parse(await readFile(new URL(`node_modules/${name}/package.json`,root),'utf8'));
  return `${pkg.name} ${pkg.version}: ${pkg.license}`;
}));
await writeFile(new URL('app/vendor/THIRD_PARTY.md',root),`# Third-party distributions\n\n${versions.join('\n\n')}\n\nUnmodified npm distributions. Run npm ci and npm run prepare:vendor to reproduce.\n`);
console.log(versions.join('\n'));
