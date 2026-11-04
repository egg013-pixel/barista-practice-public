/** Remove only this app's old persisted data; never read or create records. */
export function clearLegacyPracticeStorage(){
 if(typeof window==='undefined')return;
 try{for(const key of ['barista-public-records-v1','barista-public-sessions-v1','barista-public-active-v1'])window.localStorage.removeItem(key);}
 catch{/* Practice must also work when browser storage is unavailable. */}
}
