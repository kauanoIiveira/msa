import test from 'node:test';import assert from 'node:assert/strict';import {resolveWorkspaceRoute} from '../../app/src/ui/workspace-routes.js';
test('old routes retain their task destinations and viewer cannot open administration',()=>{
 assert.deepEqual(resolveWorkspaceRoute({route:'planning',role:'admin'}),{route:'production',tab:'planning'});
 assert.deepEqual(resolveWorkspaceRoute({route:'operations',tab:'losses',role:'operator'}),{route:'quality',tab:'losses'});
 assert.equal(resolveWorkspaceRoute({route:'registry',role:'viewer'}).route,'dashboard');
});
