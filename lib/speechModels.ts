export const speechModels={
 turbo:{id:'onnx-community/whisper-large-v3-turbo',revision:'360ebcde2559d60bb474678be3c1de9ef347d01a',label:'Whisper large-v3-turbo',megabytes:760},
 compact:{id:'onnx-community/whisper-small',revision:'36050c46d777d46dc4b5f43f6d90574fc38f8732',label:'Whisper small',megabytes:250}
} as const;
export const speechAsset=(path:string)=>(process.env.NEXT_PUBLIC_BASE_PATH||'')+path;
export type SpeechWorkerReply={id:number;type:'ready'|'result'|'progress'|'error';text?:string;message?:string};
