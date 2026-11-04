import test from 'node:test';
import assert from 'node:assert/strict';
import {clearLegacyPracticeStorage} from '../lib/legacyStorage';
test('이전 앱 기록만 삭제하고 다른 데이터는 읽거나 변경하지 않음',()=>{
 const old=Object.getOwnPropertyDescriptor(globalThis,'window');
 const removed:string[]=[];
 Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:{removeItem:(key:string)=>removed.push(key),getItem:()=>{throw Error('must not read');},setItem:()=>{throw Error('must not store');}}}});
 try{clearLegacyPracticeStorage();assert.deepEqual(removed,['barista-public-records-v1','barista-public-sessions-v1','barista-public-active-v1']);}
 finally{if(old)Object.defineProperty(globalThis,'window',old);else Reflect.deleteProperty(globalThis,'window');}
});
test('저장 공간 접근이 차단되어도 연습을 막지 않음',()=>{
 const old=Object.getOwnPropertyDescriptor(globalThis,'window');
 Object.defineProperty(globalThis,'window',{configurable:true,value:{get localStorage(){throw Error('blocked');}}});
 try{assert.doesNotThrow(clearLegacyPracticeStorage);}finally{if(old)Object.defineProperty(globalThis,'window',old);else Reflect.deleteProperty(globalThis,'window');}
});
