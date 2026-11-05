"""Regenerate fixed public prompts, not student audio (qwen-tts 0.1.1, CPU torch 2.8)."""
import os,json,re,hashlib,tempfile,argparse,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
os.environ.setdefault('HF_HOME',str(Path(tempfile.gettempdir())/'barista-hf'))
os.environ['HF_HUB_DISABLE_XET']='1'
parser=argparse.ArgumentParser();parser.add_argument('--all',action='store_true');parser.add_argument('--steps',type=int,nargs='+',choices=range(1,12));args=parser.parse_args()
revision='85e237c12c027371202489a0ec509ded67b5e4b5'
texts=re.findall(r"instruction:'([^']+)'",(root/'data/baristaScript.ts').read_text());assert len(texts)==11
folder=root/'public/audio/examiner';folder.mkdir(parents=True,exist_ok=True)
old=json.loads((folder/'manifest.json').read_text()) if (folder/'manifest.json').exists() else {'clips':[]}
speaker='Aiden'
profile='aiden-gentle-v1'
prior={c['step']:c for c in old['clips']}
missing=[i for i in range(1,12) if args.all or old.get('voice_profile')!=profile or not(folder/f'step-{i:02}.wav').exists() or prior.get(i,{}).get('text')!=texts[i-1]]
if args.steps:missing=sorted(set(args.steps))
if missing:
 import torch,soundfile as sf
 from huggingface_hub import snapshot_download
 from qwen_tts import Qwen3TTSModel
 path=snapshot_download('Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice',revision=revision,token=False,allow_patterns=['*.json','*.safetensors','*.txt','*.model','*.npz'])
 torch.set_num_threads(4);torch.manual_seed(20261105)
 model=Qwen3TTSModel.from_pretrained(path,device_map='cpu',dtype=torch.float32,attn_implementation='sdpa')
 wavs,sr=model.generate_custom_voice(text=[texts[i-1] for i in missing],language=['Korean']*len(missing),speaker=[speaker]*len(missing),non_streaming_mode=True,do_sample=True,temperature=.7,top_p=.9,repetition_penalty=1.05,max_new_tokens=256)
 for i,wav in zip(missing,wavs):
  with tempfile.TemporaryDirectory() as temp:
   raw=Path(temp)/'raw.wav';sf.write(raw,wav,sr,subtype='PCM_16')
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(raw),'-af','loudnorm=I=-20:TP=-3:LRA=7,afade=t=in:d=0.01','-ar',str(sr),'-ac','1','-c:a','pcm_s16le',str(folder/f'step-{i:02}.wav')],check=True)
import wave
manifest={'model':'Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice','revision':revision,'license':'Apache-2.0','speaker':speaker,'voice_profile':profile,'postprocess':'loudnorm I=-20 LUFS TP=-3 dB LRA=7; 10ms fade-in','language':'Korean','clips':[]}
for i,text in enumerate(texts,1):
 path=folder/f'step-{i:02}.wav'
 with wave.open(str(path)) as wav:duration=wav.getnframes()/wav.getframerate()
 manifest['clips'].append({'step':i,'text':text,'file':path.name,'seconds':duration,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
(folder/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Generated/verified fixed prompts; listen and transcribe before publishing.')
