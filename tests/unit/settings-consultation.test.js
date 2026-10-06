import test from 'node:test';
import assert from 'node:assert/strict';
import {readConsultation,writeConsultation} from '../../app/src/ui/consultation.js';
test('consultation choices persist without changing theme and reject unsupported windows',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 assert.deepEqual(readConsultation(storage),{days:7,compact:false});
 assert.deepEqual(writeConsultation({days:14,compact:true},storage),{days:14,compact:true});
 assert.deepEqual(readConsultation(storage),{days:14,compact:true});
 assert.deepEqual(writeConsultation({days:-1,compact:'true'},storage),{days:7,compact:false});
});
