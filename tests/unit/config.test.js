import {test} from 'node:test';
import assert from 'node:assert/strict';
import {firebaseConfig} from '../../app/src/config/firebase.js';
import {initializeApp,deleteApp} from 'firebase/app';
test('initializes the supplied project with the supplied RTDB URL',async()=>{
  const app=initializeApp(firebaseConfig,'config-test');
  assert.equal(app.options.projectId,'msayellowteam');
  assert.equal(app.options.databaseURL,'https://msayellowteam-default-rtdb.firebaseio.com');
  assert.equal(app.options.appId,'1:638153677516:web:f7d4fe600782d1be9c0069');
  await deleteApp(app);
});
