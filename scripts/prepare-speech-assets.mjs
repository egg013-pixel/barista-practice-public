import {mkdir,copyFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir=new URL('../public/onnx/',import.meta.url);await mkdir(dir,{recursive:true});
for(const file of ['ort-wasm-simd-threaded.wasm','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.jsep.wasm','ort-wasm-simd-threaded.jsep.mjs'])await copyFile(new URL('../node_modules/onnxruntime-web/dist/'+file,import.meta.url),new URL(file,dir));
const voiceDir=new URL('../public/audio/examiner/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',voiceDir),'utf8'));
const source=await readFile(new URL('../data/baristaScript.ts',import.meta.url),'utf8');
const instructions=[...source.matchAll(/instruction:'([^']+)'/g)].map(match=>match[1]);
if(instructions.length!==11||manifest.clips.length!==11)throw Error('11개 안내 음성 파일이 필요합니다.');
for(let i=0;i<11;i++){
 const clip=manifest.clips[i];
 if(clip.step!==i+1||clip.text!==instructions[i])throw Error('안내 문구가 바뀌었습니다. scripts/generate-examiner-audio.py로 음성을 갱신하세요.');
 const data=await readFile(new URL(clip.file,voiceDir));
 if(createHash('sha256').update(data).digest('hex')!==clip.sha256)throw Error('안내 음성 파일 해시가 다릅니다.');
}
