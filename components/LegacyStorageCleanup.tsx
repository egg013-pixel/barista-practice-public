'use client';
import {useEffect} from 'react';
import {clearLegacyPracticeStorage} from '@/lib/legacyStorage';
export function LegacyStorageCleanup(){
 useEffect(()=>{clearLegacyPracticeStorage();},[]);
 return null;
}
