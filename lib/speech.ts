export interface SpeechResultEvent { results: {isFinal:boolean;0:{transcript:string}}[]; resultIndex:number }
export interface SpeechRecognizer {
  lang:string; continuous:boolean; interimResults:boolean;
  onresult:((e:SpeechResultEvent)=>void)|null; onerror:((e:{error:string})=>void)|null;
  onend:(()=>void)|null; start:()=>void; stop:()=>void; abort:()=>void;
}
export function createRecognition():SpeechRecognizer|null {
  if(typeof window==='undefined') return null;
  const w=window as unknown as {SpeechRecognition?:new()=>SpeechRecognizer;webkitSpeechRecognition?:new()=>SpeechRecognizer};
  const Constructor=w.SpeechRecognition||w.webkitSpeechRecognition;
  if(!Constructor) return null;
  const recognition=new Constructor();recognition.lang='ko-KR';recognition.continuous=true;recognition.interimResults=true;
  return recognition;
}
export const speechErrors:Record<string,string>={
  'not-allowed':'마이크 사용을 허용해 주세요. 직접 입력으로도 연습할 수 있어요.',
  'audio-capture':'마이크를 확인해 주세요. 직접 입력으로도 연습할 수 있어요.',
  'network':'음성 인식에 연결할 수 없어요. 직접 입력해 주세요.',
  'no-speech':'목소리를 듣지 못했어요. 다시 말해보세요.',
  'service-not-allowed':'이 브라우저에서 음성 인식을 사용할 수 없어요. 직접 입력해 주세요.'
};
