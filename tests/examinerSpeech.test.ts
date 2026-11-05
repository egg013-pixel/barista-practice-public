import test from 'node:test';
import assert from 'node:assert/strict';
import {speakExaminerInstruction,stopExaminerSpeech,setExaminerVoiceEnabled} from '../lib/examinerSpeech';
test('고정 Qwen 음성은 단계 파일을 재생하고, 취소된 자동 재생은 시작하지 않음',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const previous=['window','Audio'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)] as const);
 const played:string[]=[];let pauses=0;
 class MockAudio{src='';preload='';onerror=null;onended=null;play(){played.push(this.src);return Promise.resolve();}pause(){pauses++;}load(){}removeAttribute(){this.src='';}}
 Object.defineProperty(globalThis,'window',{configurable:true,value:{}});Object.defineProperty(globalThis,'Audio',{configurable:true,value:MockAudio});
 try{
  speakExaminerInstruction(1);stopExaminerSpeech();t.mock.timers.tick(1);assert.equal(played.length,0);
  speakExaminerInstruction(2);t.mock.timers.tick(1);assert.deepEqual(played,['/audio/examiner/step-02.wav?voice=aiden-gentle-v1']);
  stopExaminerSpeech();assert.ok(pauses>0);
  setExaminerVoiceEnabled(false);speakExaminerInstruction(3);t.mock.timers.tick(1);assert.equal(played.length,1);
  setExaminerVoiceEnabled(true);speakExaminerInstruction(4,undefined,true);assert.equal(played.at(-1),'/audio/examiner/step-04.wav?voice=aiden-gentle-v1');
 }finally{stopExaminerSpeech();setExaminerVoiceEnabled(true);for(const[key,descriptor]of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}}
});
