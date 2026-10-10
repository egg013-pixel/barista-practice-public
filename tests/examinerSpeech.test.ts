import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseExaminerVoice, speakExaminerInstruction, stopExaminerSpeech } from '../lib/examinerSpeech';

test('한국어 남성을 우선하고 없으면 한국어 기본 음성을 고른다', () => {
 const voice = (name:string,lang:string,defaultVoice=false) => ({name,lang,default:defaultVoice} as SpeechSynthesisVoice);
 const female=voice('Korean female','ko-KR',true), male=voice('Microsoft InJoon','ko-KR');
 assert.equal(chooseExaminerVoice([voice('English male','en-US'),female,male]),male);
 assert.equal(chooseExaminerVoice([female]),female);
 assert.equal(chooseExaminerVoice([voice('English male','en-US')]),undefined);
});

test('마이크가 안내를 취소하면 늦은 음성 목록과 타이머도 재생하지 않는다', t => {
 t.mock.timers.enable({apis:['setTimeout']});
 let listener:(()=>void)|undefined;
 let spoken=0;
 let available=false;
 const previous=Object.getOwnPropertyDescriptor(globalThis,'window');
 Object.defineProperty(globalThis,'window',{configurable:true,value:{speechSynthesis:{
  getVoices:()=>available?[{lang:'ko-KR',name:'InJoon'}]:[], cancel(){}, speak(){spoken++;},
  addEventListener(_event:string,fn:()=>void){listener=fn;},
  removeEventListener(){listener=undefined;}
 }}});
 try {
  speakExaminerInstruction('인사해 주세요.');
  const delayed=listener;
  stopExaminerSpeech();
  assert.equal(listener,undefined);
  available=true;
  delayed?.();
  t.mock.timers.tick(1500);
  assert.equal(spoken,0);
 } finally {
  stopExaminerSpeech();
  if(previous)Object.defineProperty(globalThis,'window',previous);
  else Reflect.deleteProperty(globalThis,'window');
 }
});
