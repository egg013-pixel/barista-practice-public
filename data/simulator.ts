export interface SimulatorAction {id:string;label:string;target:'water'|'machine'|'grinder'|'milk'|'tray'|'table'|'cloth';view:'judge'|'station';description:string}
const a=(id:string,label:string,target:SimulatorAction['target'],description:string):SimulatorAction=>({id,label,target,view:target==='table'?'judge':'station',description});
// 조작을 익히기 위한 간소화된 동작입니다. 공식 시험 세부 제조 기준을 채점하지 않습니다.
const espresso=(prefix:string)=>[
 a(prefix+'-grind','원두 분쇄하기','grinder','그라인더에서 원두를 분쇄해요.'),
 a(prefix+'-tamp','커피 다져 담기','tray','포터필터에 담긴 커피를 고르게 다져요.'),
 a(prefix+'-lock','포터필터 장착하기','machine','머신에 포터필터를 장착해요.'),
 a(prefix+'-extract','에스프레소 두 잔 추출하기','machine','두 잔의 에스프레소가 준비됐어요.')];
export const simulatorActions:Record<number,SimulatorAction[]>={
 1:[],2:[],3:[],4:[],
 5:[a('water-fill','물잔 준비하기','water','물잔에 물을 담아 서빙할 준비를 해요.')],
 6:[a('water-take','물잔 들기','water','물을 담은 잔을 들어요.'),a('water-serve','심사위원에게 물 서빙하기','table','심사위원 책상에 물을 내려놓아요.')],
 7:espresso('espresso'),
 8:[a('espresso-take','에스프레소 두 잔 들기','tray','준비된 두 잔을 트레이에 담아요.'),a('espresso-serve','에스프레소 두 잔 서빙하기','table','심사위원께 에스프레소 두 잔을 드려요.')],
 9:[...espresso('cappuccino'),a('milk-fill','피처에 우유 담기','milk','우유를 피처에 담아요.'),a('milk-steam','우유 거품 만들기','machine','스팀 완드로 우유 거품을 만들어요.'),a('milk-pour','두 잔에 우유 거품 붓기','milk','에스프레소에 우유 거품을 부어 카푸치노 두 잔을 완성해요.')],
 10:[a('cappuccino-take','카푸치노 두 잔 들기','tray','완성한 카푸치노 두 잔을 트레이에 담아요.'),a('cappuccino-serve','카푸치노 두 잔 서빙하기','table','심사위원께 카푸치노 두 잔을 드려요.')],
 11:[a('clean-rinse','머신 린싱하기','machine','머신을 린싱해요.'),a('clean-wipe','작업대와 도구 정리하기','cloth','작업대를 닦고 도구와 린넨을 정리해요.')]
};
export function currentAction(step:number,completed:string[]) {return (simulatorActions[step]||[]).find(a=>!completed.includes(a.id));}
export function actionsComplete(step:number,completed:string[]) {return !currentAction(step,completed);}
export function completeAction(step:number,completed:string[],id:string):string[] {
 if(currentAction(step,completed)?.id!==id)return completed;
 return [...completed,id];
}
