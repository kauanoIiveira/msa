import test from 'node:test';
import assert from 'node:assert/strict';
import {visibleNavigation,initialRoute,resolveRoute} from '../../app/src/ui/access.js';
test('navigation and typed hashes do not expose management to operation or consultation',()=>{
 assert.equal(initialRoute('engineer'),'engineering');assert.equal(initialRoute('operator'),'operations');assert.equal(initialRoute('viewer'),'dashboard');
 for(const role of ['operator','viewer'])for(const route of ['registry','engineering']){assert.equal(visibleNavigation(role).includes(route),false);assert.equal(resolveRoute(route,role),initialRoute(role));}
 assert.equal(resolveRoute('settings','viewer'),'settings');assert.equal(resolveRoute('planning','engineer'),'planning');assert.equal(resolveRoute('registry','admin'),'registry');
});
