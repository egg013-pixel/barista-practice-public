import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteSessions } from '../lib/storage';

test('저장 실패 시 삭제 이전 기록·세션·이어하기를 보존한다', () => {
 const data=new Map<string,string>([
  ['barista-public-records-v1',JSON.stringify([{sessionId:'one',recordId:'attempt'}])],
  ['barista-public-sessions-v1',JSON.stringify([{id:'one'}])],
  ['barista-public-active-v1',JSON.stringify('one')]
 ]);
 const original=new Map(data);
 let fail=true;
 const descriptors=['window','localStorage'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)] as const);
 Object.defineProperty(globalThis,'window',{configurable:true,value:{}});
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
  getItem:(key:string)=>data.get(key)??null,
  setItem:(key:string,value:string)=>{if(key==='barista-public-sessions-v1'&&fail){fail=false;throw new Error('quota');}data.set(key,value);},
  removeItem:(key:string)=>data.delete(key)
 }});
 try {
  assert.throws(()=>deleteSessions(['one']),/quota/);
  assert.deepEqual(data,original);
 } finally {
  for(const [key,descriptor] of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
 }
});
